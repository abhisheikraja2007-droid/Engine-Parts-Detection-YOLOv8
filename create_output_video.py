#!/usr/bin/env python3
"""
Create output video with detections using optimized confidence threshold
Run: python create_output_video.py
"""
import cv2
import os
os.environ["CUDA_VISIBLE_DEVICES"] = ""

from ultralytics import YOLO
from pathlib import Path

MODEL_PATH = Path(r"C:\Users\Admin\runs\detect\runs\detect\engine_full\weights\best.pt")
VIDEO_PATH = Path(r"C:\Users\Admin\Desktop\test.mp4")
OUTPUT_PATH = Path(r"D:\projects\Engine Detection\test_output_final.mp4")

CLASS_NAMES = ["crankshaft", "piston", "cylinder_block", "connecting_rod"]
COLORS = {
    0: (0, 255, 255),   # crankshaft
    1: (255, 128, 0),   # piston
    2: (0, 128, 255),   # cylinder_block
    3: (255, 0, 255),   # connecting_rod
}

CONF_THRESHOLD = 0.15  # Optimized threshold

def main():
    if not MODEL_PATH.exists():
        print(f"Model not found: {MODEL_PATH}")
        return
    
    print(f"Loading model: {MODEL_PATH}")
    model = YOLO(str(MODEL_PATH))
    model.to("cpu")
    
    cap = cv2.VideoCapture(str(VIDEO_PATH))
    if not cap.isOpened():
        print(f"Cannot open video: {VIDEO_PATH}")
        return
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"Video: {width}x{height} @ {fps:.1f} FPS, {total_frames} frames")
    print(f"Confidence threshold: {CONF_THRESHOLD}")
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(str(OUTPUT_PATH), fourcc, fps, (width, height))
    
    frame_count = 0
    total_detections = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Inference
        results = model(frame, conf=CONF_THRESHOLD, verbose=False, device="cpu")
        
        # Draw detections
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                
                if cls_id >= len(CLASS_NAMES):
                    continue
                
                total_detections += 1
                color = COLORS.get(cls_id, (255, 255, 255))
                label = f"{CLASS_NAMES[cls_id]} {conf:.2f}"
                
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                cv2.rectangle(frame, (x1, y1 - th - 8), (x1 + tw + 8, y1), color, -1)
                cv2.putText(frame, label, (x1 + 4, y1 - 4),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
        
        out.write(frame)
        frame_count += 1
        
        if frame_count % 50 == 0:
            print(f"Processed {frame_count}/{int(cap.get(cv2.CAP_PROP_FRAME_COUNT))} frames...")
    
    cap.release()
    out.release()
    print(f"\nDone! Output: {OUTPUT_PATH}")
    print(f"Total frames: {frame_count}")

if __name__ == "__main__":
    main()