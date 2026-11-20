#!/usr/bin/env python3
"""
Real-time engine parts detection → fullscreen HDMI output for TV.
Run: python infer_tv.py

Keys:
  'q' - quit
  'f' - toggle fullscreen
  's' - save current frame
  'c' - toggle confidence threshold display
"""
import cv2
import numpy as np
from ultralytics import YOLO
import torch
from pathlib import Path

# Configuration
MODEL_PATH = "runs/detect/engine_parts/weights/best.pt"
CONF_THRESHOLD = 0.35
IOU_THRESHOLD = 0.45
CAMERA_INDEX = 0  # 0 = default webcam, 1 = external
TARGET_FPS = 30

# Class colors (BGR for OpenCV)
COLORS = {
    "crankshaft": (0, 255, 255),      # Yellow
    "main_bearing": (0, 200, 255),    # Orange
    "connecting_rod": (255, 0, 255),  # Magenta
    "piston": (255, 128, 0),          # Blue-Orange
    "piston_ring": (128, 255, 0),     # Light Green
    "cylinder_block": (0, 128, 255),  # Dark Orange
    "timing_gear": (255, 255, 0),     # Cyan
    "oil_pump": (255, 0, 128),        # Pink
    "water_pump": (0, 255, 128),      # Spring Green
    "alternator": (128, 0, 255),      # Purple
    "spark_plug": (255, 64, 64),      # Red
    "oil_filter": (64, 255, 64),      # Green
    "radiator": (64, 64, 255),        # Blue
    "thermostat": (192, 192, 192),    # Silver
    "flywheel": (128, 128, 0),        # Olive
    "torque_wrench": (0, 192, 192),   # Teal
}

DEFAULT_COLOR = (255, 255, 255)  # White

def draw_detections(frame, results, class_names, show_conf=True):
    """Draw bounding boxes and labels on frame."""
    annotated = frame.copy()
    
    for r in results:
        boxes = r.boxes
        if boxes is None:
            continue
            
        for box in boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            
            if conf < CONF_THRESHOLD:
                continue
                
            class_name = class_names[cls_id] if cls_id < len(class_names) else f"class_{cls_id}"
            color = COLORS.get(class_name, DEFAULT_COLOR)
            
            # Draw box
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            
            # Label background
            label = f"{class_name} {conf:.2f}" if show_conf else class_name
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(annotated, (x1, y1 - th - 8), (x1 + tw + 4, y1), color, -1)
            
            # Label text
            cv2.putText(annotated, label, (x1 + 2, y1 - 4),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
    
    return annotated

def main():
    # Load model
    if not Path(MODEL_PATH).exists():
        print(f"Model not found: {MODEL_PATH}")
        print("Run train.py first, or download a pre-trained model.")
        return
    
    print(f"Loading model: {MODEL_PATH}")
    model = YOLO(MODEL_PATH)
    class_names = model.names
    print(f"Classes: {class_names}")
    
    # Open camera
    cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_DSHOW)  # CAP_DSHOW for Windows
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, TARGET_FPS)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
    if not cap.isOpened():
        print(f"Cannot open camera index {CAMERA_INDEX}")
        return
    
    actual_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    actual_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    actual_fps = cap.get(cv2.CAP_PROP_FPS)
    print(f"Camera: {actual_w}x{actual_h} @ {actual_fps:.1f} FPS")
    
    # Fullscreen window
    cv2.namedWindow("Engine Parts Detection", cv2.WINDOW_NORMAL)
    cv2.setWindowProperty("Engine Parts Detection", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
    
    fullscreen = True
    show_conf = True
    frame_count = 0
    
    print("\nRunning... Press 'q' to quit, 'f' to toggle fullscreen, 's' to save frame")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Frame grab failed")
            break
        
        # Inference
        results = model(frame, conf=CONF_THRESHOLD, iou=IOU_THRESHOLD, verbose=False)
        
        # Annotate
        annotated = draw_detections(frame, results, class_names, show_conf)
        
        # FPS counter
        frame_count += 1
        cv2.putText(annotated, f"Frame: {frame_count}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Show
        cv2.imshow("Engine Parts Detection", annotated)
        
        # Keys
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('f'):
            fullscreen = not fullscreen
            cv2.setWindowProperty("Engine Parts Detection", cv2.WND_PROP_FULLSCREEN,
                                 cv2.WINDOW_FULLSCREEN if fullscreen else cv2.WINDOW_NORMAL)
        elif key == ord('s'):
            cv2.imwrite(f"capture_{frame_count}.jpg", annotated)
            print(f"Saved capture_{frame_count}.jpg")
        elif key == ord('c'):
            show_conf = not show_conf
    
    cap.release()
    cv2.destroyAllWindows()
    print("Done.")

if __name__ == "__main__":
    main()