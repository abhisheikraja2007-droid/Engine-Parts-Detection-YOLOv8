#!/usr/bin/env python3
"""
Test trained model on webcam → save annotated frames (no GUI window).
Run: python test_model.py
Outputs: test_output/frame_XXX.jpg with detections
"""
import cv2
import os
os.environ["CUDA_VISIBLE_DEVICES"] = ""

from pathlib import Path
from ultralytics import YOLO

# Find best trained model
MODEL_PATHS = [
    "runs/detect/engine_fast/weights/best.pt",
    "runs/detect/engine_catalog/weights/best.pt",
    "runs/detect/engine_merged/weights/best.pt",
    "runs/detect/engine_parts/weights/best.pt",
    "yolov8n.pt",
]

CLASS_NAMES = ["crankshaft", "piston", "cylinder_block", "connecting_rod"]
COLORS = {
    0: (0, 255, 255),   # crankshaft
    1: (255, 128, 0),   # piston
    2: (0, 128, 255),   # cylinder_block
    3: (255, 0, 255),   # connecting_rod
}

OUTPUT_DIR = Path("test_output")
OUTPUT_DIR.mkdir(exist_ok=True)

def find_model():
    for p in MODEL_PATHS:
        if Path(p).exists():
            print(f"Using model: {p}")
            return p
    print("No trained model found, using yolov8n.pt (COCO)")
    return "yolov8n.pt"

def main():
    model_path = find_model()
    model = YOLO(model_path)
    model.to("cpu")
    
    names = model.names if hasattr(model, 'names') else CLASS_NAMES
    print(f"Classes: {names}")
    
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
    if not cap.isOpened():
        print("Cannot open camera")
        return
    
    print("Running... Press Ctrl+C to stop. Saving frames to test_output/")
    
    frame_count = 0
    saved = 0
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            results = model(frame, conf=0.25, verbose=False, device="cpu")
            
            # Draw detections
            for r in results:
                for box in r.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    
                    if cls_id >= len(names):
                        continue
                    
                    color = COLORS.get(cls_id, (255, 255, 255))
                    label = f"{names[cls_id]} {conf:.2f}"
                    
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                    cv2.rectangle(frame, (x1, y1 - th - 8), (x1 + tw + 4, y1), color, -1)
                    cv2.putText(frame, label, (x1 + 2, y1 - 4),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
            
            # Save every 30th frame
            if frame_count % 30 == 0:
                out_path = OUTPUT_DIR / f"frame_{saved:04d}.jpg"
                cv2.imwrite(str(out_path), frame)
                print(f"Saved {out_path} - detections: {len(results[0].boxes) if results[0].boxes else 0}")
                saved += 1
            
            frame_count += 1
            
    except KeyboardInterrupt:
        print("\nStopped")
    
    cap.release()
    print(f"Done. {saved} frames saved to {OUTPUT_DIR}")

if __name__ == "__main__":
    main()