#!/usr/bin/env python3
"""
Unified Video + Live Detection with Detection Log Panel
Run: python detect_ui.py

Features:
- Process video file OR live webcam
- Real-time bounding boxes with part names
- Side panel showing detection log/history
- Press 'v' to switch to video file, 'c' for webcam
- Press 'q' to quit, 's' to save screenshot
"""

import cv2
import os
os.environ["CUDA_VISIBLE_DEVICES"] = ""

from ultralytics import YOLO
from pathlib import Path
import time
from collections import deque

MODEL_PATH = Path(r"D:\projects\Engine Detection\best.pt")
DEFAULT_VIDEO = Path(r"C:\Users\Admin\Desktop\test.mp4")

CLASS_NAMES = ["crankshaft", "piston", "cylinder_block", "connecting_rod"]
COLORS = {
    0: (0, 255, 255),   # crankshaft - yellow
    1: (255, 128, 0),   # piston - orange
    2: (0, 128, 255),   # cylinder_block - blue
    3: (255, 0, 255),   # connecting_rod - magenta
}

# Panel settings
PANEL_WIDTH = 350
LOG_MAX_ITEMS = 20

class DetectionLog:
    def __init__(self, max_items=LOG_MAX_ITEMS):
        self.max_items = max_items
        self.entries = deque(maxlen=max_items)
        self.counts = {name: 0 for name in CLASS_NAMES}
    
    def add(self, class_name, confidence):
        timestamp = time.strftime("%H:%M:%S")
        self.entries.appendleft({
            'time': timestamp,
            'class': class_name,
            'conf': confidence
        })
        self.counts[class_name] += 1
    
    def draw(self, panel, y_start=60):
        # Title
        cv2.putText(panel, "DETECTION LOG", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Counts summary
        y = y_start
        for name in CLASS_NAMES:
            count = self.counts[name]
            color = COLORS[CLASS_NAMES.index(name)]
            cv2.putText(panel, f"{name}: {count}", (10, y),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)
            y += 25
        
        # Separator
        cv2.line(panel, (10, y + 5), (PANEL_WIDTH - 10, y + 5), (80, 80, 80), 1)
        y += 20
        
        # Recent detections
        cv2.putText(panel, "RECENT:", (10, y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.55, (200, 200, 200), 1)
        y += 22
        
        for entry in self.entries:
            if y > panel.shape[0] - 20:
                break
            color = COLORS[CLASS_NAMES.index(entry['class'])]
            text = f"{entry['time']}  {entry['class']}  {entry['conf']:.2f}"
            cv2.putText(panel, text, (10, y),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1)
            y += 20


def draw_detections(frame, results):
    """Draw bounding boxes and labels on frame."""
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            
            if cls_id >= len(CLASS_NAMES):
                continue
            
            color = COLORS.get(cls_id, (255, 255, 255))
            label = f"{CLASS_NAMES[cls_id]} {conf:.2f}"
            
            # Rectangle
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            
            # Label background
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(frame, (x1, y1 - th - 10), (x1 + tw + 8, y1), color, -1)
            
            # Label text
            cv2.putText(frame, label, (x1 + 4, y1 - 6),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
            
            yield CLASS_NAMES[cls_id], conf


def main():
    if not MODEL_PATH.exists():
        print(f"Model not found: {MODEL_PATH}")
        return
    
    print(f"Loading model: {MODEL_PATH}")
    model = YOLO(str(MODEL_PATH))
    model.to("cpu")
    
    # Start with webcam
    use_webcam = True
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
    if not cap.isOpened():
        print("Webcam failed, trying video file...")
        use_webcam = False
        if DEFAULT_VIDEO.exists():
            cap = cv2.VideoCapture(str(DEFAULT_VIDEO))
        else:
            print("No video source found")
            return
    
    # Window setup
    cv2.namedWindow("Engine Parts Detection", cv2.WINDOW_NORMAL)
    cv2.setWindowProperty("Engine Parts Detection", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
    
    log = DetectionLog()
    fullscreen = True
    frame_count = 0
    
    print("\n=== CONTROLS ===")
    print("  c  - Switch to webcam")
    print("  v  - Switch to video file")
    print("  f  - Toggle fullscreen")
    print("  s  - Save screenshot")
    print("  r  - Reset detection log")
    print("  q  - Quit")
    print("\nRunning...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            if not use_webcam:
                # Loop video
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            else:
                break
        
        # Inference
        results = model(frame, conf=0.25, verbose=False, device="cpu")
        
        # Draw detections + update log
        for class_name, conf in draw_detections(frame, results):
            log.add(class_name, conf)
        
        # Create side panel
        h, w = frame.shape[:2]
        panel = np.zeros((h, PANEL_WIDTH, 3), dtype=np.uint8)
        panel[:] = (30, 30, 30)  # Dark gray background
        
        # Mode indicator
        mode_text = "WEBCAM" if use_webcam else "VIDEO FILE"
        cv2.putText(panel, mode_text, (10, h - 40),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        cv2.putText(panel, "Press 'c' for cam, 'v' for video", (10, h - 15),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.45, (150, 150, 150), 1)
        
        log.draw(panel)
        
        # Combine frame + panel
        combined = np.hstack([frame, panel])
        
        # Show
        cv2.imshow("Engine Parts Detection", combined)
        
        # Keys
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('f'):
            fullscreen = not fullscreen
            cv2.setWindowProperty("Engine Parts Detection", cv2.WND_PROP_FULLSCREEN,
                                 cv2.WINDOW_FULLSCREEN if fullscreen else cv2.WINDOW_NORMAL)
        elif key == ord('s'):
            cv2.imwrite(f"screenshot_{time.strftime('%H%M%S')}.jpg", combined)
            print("Screenshot saved")
        elif key == ord('r'):
            log = DetectionLog()
            print("Log reset")
        elif key == ord('c'):
            if not use_webcam:
                cap.release()
                cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                use_webcam = True
                print("Switched to WEBCAM")
        elif key == ord('v'):
            if use_webcam:
                cap.release()
                if DEFAULT_VIDEO.exists():
                    cap = cv2.VideoCapture(str(DEFAULT_VIDEO))
                    use_webcam = False
                    print(f"Switched to VIDEO: {DEFAULT_VIDEO}")
                else:
                    print("Video file not found")
                    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    
    cap.release()
    cv2.destroyAllWindows()
    print("Done.")


if __name__ == "__main__":
    import numpy as np
    main()