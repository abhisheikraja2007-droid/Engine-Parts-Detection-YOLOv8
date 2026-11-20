#!/usr/bin/env python3
"""
Web Interface for Engine Parts Detection
Run: python web_server.py
Then open: http://localhost:8000
"""
import os
os.environ["CUDA_VISIBLE_DEVICES"] = ""

from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import cv2
import numpy as np
from ultralytics import YOLO
from pathlib import Path
import asyncio
import json
import base64
import tempfile
import shutil
import time
from typing import List

MODEL_PATH = Path(r"D:\projects\Engine Detection\best_full.pt")

CLASS_NAMES = ["crankshaft", "piston", "cylinder_block", "connecting_rod"]
COLORS = {
    0: (0, 255, 255),   # crankshaft
    1: (255, 128, 0),   # piston
    2: (0, 128, 255),   # cylinder_block
    3: (255, 0, 255),   # connecting_rod
}

app = FastAPI(title="Engine Parts Detection")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
model = YOLO(str(MODEL_PATH))
model.to("cpu")

# Store active connections
active_connections: List[WebSocket] = []

# Upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def process_frame(frame):
    """Run detection on frame and return annotated frame + counts."""
    results = model(frame, conf=0.15, verbose=False, device="cpu")
    
    counts = {name: 0 for name in CLASS_NAMES}
    
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            
            if cls_id >= len(CLASS_NAMES):
                continue
            
            counts[CLASS_NAMES[cls_id]] += 1
            color = COLORS.get(cls_id, (255, 255, 255))
            label = f"{CLASS_NAMES[cls_id]} {conf:.2f}"
            
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(frame, (x1, y1 - th - 8), (x1 + tw + 8, y1), color, -1)
            cv2.putText(frame, label, (x1 + 4, y1 - 4),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
    
    return frame, counts


def frame_to_base64(frame):
    """Convert frame to base64 JPEG."""
    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
    return base64.b64encode(buffer).decode('utf-8')


@app.get("/", response_class=HTMLResponse)
async def index():
    return FileResponse("static/index.html")


@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    """Upload video file."""
    if not file.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    # Save to temp file
    suffix = Path(file.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, dir=UPLOAD_DIR) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    return {
        "filename": file.filename,
        "path": tmp_path,
        "size": len(content)
    }


@app.websocket("/ws/detect")
async def websocket_detect(websocket: WebSocket):
    """WebSocket for real-time video detection."""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            
            if msg["type"] == "process_video":
                video_path = msg["path"]
                await process_video_websocket(websocket, video_path)
                
            elif msg["type"] == "process_frame":
                # Single frame from webcam
                frame_data = base64.b64decode(msg["frame"])
                nparr = np.frombuffer(frame_data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if frame is not None:
                    processed, counts = process_frame(frame)
                    await websocket.send_json({
                        "type": "frame_result",
                        "frame": frame_to_base64(processed),
                        "counts": counts
                    })
                    
    except WebSocketDisconnect:
        active_connections.remove(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        if websocket in active_connections:
            active_connections.remove(websocket)


async def process_video_websocket(websocket: WebSocket, video_path: str):
    """Process video file frame-by-frame via WebSocket using thread pool for inference."""
    print(f"DEBUG: process_video_websocket called with path: {video_path}")
    
    # Get video info first (in main thread)
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        await websocket.send_json({"type": "error", "message": "Cannot open video"})
        return
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    cap.release()
    
    await websocket.send_json({
        "type": "video_info",
        "total_frames": total_frames,
        "fps": fps
    })
    
    # Process frames one by one using thread pool for inference
    loop = asyncio.get_event_loop()
    frame_num = 0
    
    def process_single_frame(frame):
        """Process a single frame - runs in thread pool."""
        return process_frame(frame)
    
    try:
        while True:
            # Check if websocket is still connected
            if websocket.client_state.name != "CONNECTED":
                print("WebSocket disconnected, stopping video processing")
                break
            
            # Read frame in main thread (fast)
            cap = cv2.VideoCapture(video_path)
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
            ret, frame = cap.read()
            cap.release()
            
            if not ret:
                # Loop video
                frame_num = 0
                try:
                    await websocket.send_json({"type": "video_loop"})
                except RuntimeError:
                    # WebSocket closed
                    break
                continue
            
            # Process frame in thread pool (avoids blocking event loop)
            processed, counts = await loop.run_in_executor(None, lambda: process_frame(frame.copy()))
            frame_num += 1
            print(f"DEBUG: Frame {frame_num}, counts: {counts}")
            
            frame_b64 = frame_to_base64(processed)
            try:
                await websocket.send_json({
                    "type": "frame",
                    "frame_num": frame_num,
                    "total_frames": int(cv2.VideoCapture(video_path).get(cv2.CAP_PROP_FRAME_COUNT)),
                    "frame": frame_b64,
                    "counts": counts
                })
            except RuntimeError:
                # WebSocket closed
                print("WebSocket closed during send, stopping")
                break
            
            # Control playback speed
            await asyncio.sleep(1.0 / 30)
            
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"Video processing error: {e}")
    finally:
        print("Video processing stopped")


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": True}


if __name__ == "__main__":
    # Create static directory
    static_dir = Path("static")
    static_dir.mkdir(exist_ok=True)
    
    print("Starting web server at http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)