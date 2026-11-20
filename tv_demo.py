#!/usr/bin/env python3
"""
Final TV Demo — Engine Parts Detection
Uses trained model (best.pt) → webcam → fullscreen HDMI
Run: python tv_demo.py
"""
import cv2
import os
os.environ["CUDA_VISIBLE_DEVICES"] = ""

from ultralytics import YOLO
from pathlib import Path

MODEL_PATH = Path("best.pt")
if not MODEL_PATH.exists():
    MODEL_PATH = Path(r"C:\Users\Admin\runs\detect\runs\detect\engine_fast\weights\best.pt")

CLASS_NAMES = ["crankshaft", "piston", "cylinder_block", "connecting_rod"]
COLORS = {
    0: (0, 255, 255),   # crankshaft - yellow
    1: (255, 128, 0),   # piston - orange
    2: (0, 128, 255),   # cylinder_block - blue
    3: (255, 0, 255),   # connecting_rod - magenta
}

def main():
    print(f"Loading model: {MODEL_PATH}")
    model = YOLO(str(MODEL_PATH))
    model.to("cpu")
    
    names = model.names
    print(f"Classes: {names}")
    
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
    if not cap.isOpened():
        print("Cannot open camera index 0. Trying 1...")
        cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
        if not cap.isOpened():
            print("No camera found")
            return
    
    # Fullscreen window
    cv2.namedWindow("Engine Parts Detection - TV Demo", cv2.WINDOW_NORMAL)
    cv2.setWindowProperty("Engine Parts Detection - TV Demo", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
    
    print("\n=== RUNNING ON TV ===")
    print("Keys: 'q' = quit, 'f' = toggle fullscreen, 's' = save frame")
    
    fullscreen = True
    
    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        
        # Inference
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
                (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                cv2.rectangle(frame, (x1, y1 - th - 10), (x1 + tw + 8, y1), color, -1)
                cv2.putText(frame, label, (x1 + 4, y1 - 6),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        
        # Status overlay
        cv2.putText(frame, "Engine Parts Detection", (20, 40),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, f"Model: {MODEL_PATH.name}", (20, 80),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        cv2.imshow("Engine Parts Detection - TV Demo", frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('f'):
            fullscreen = not fullscreen
            cv2.setWindowProperty("Engine Parts Detection - TV Demo", cv2.WND_PROP_FULLSCREEN,
                                 cv2.WINDOW_FULLSCREEN if fullscreen else cv2.WINDOW_NORMAL)
        elif key == ord('s'):
            cv2.imwrite(f"tv_capture_{cv2.getTickCount()}.jpg", frame)
            print("Frame saved")
    
    cap.release()
    cv2.destroyAllWindows()
    print("Demo ended.")

if __name__ == "__main__":
    main()