#!/usr/bin/env python3
"""
Auto-label video frames using pre-trained YOLOv8 (COCO classes) — CPU mode.
Run: python auto_label_frames.py
"""
import os
os.environ["CUDA_VISIBLE_DEVICES"] = ""  # Force CPU

from ultralytics import YOLO
import cv2
from pathlib import Path
import shutil

FRAMES_DIR = Path("data/frames_raw")
OUTPUT_IMAGES = Path("data/yolo_auto/images")
OUTPUT_LABELS = Path("data/yolo_auto/labels")
OUTPUT_IMAGES.mkdir(parents=True, exist_ok=True)
OUTPUT_LABELS.mkdir(parents=True, exist_ok=True)

# Map COCO classes to our 4 target classes
COCO_TO_TARGET = {
    "car": "crankshaft",
    "truck": "cylinder_block",
    "bus": "cylinder_block",
    "motorcycle": "connecting_rod",
    "bicycle": "piston",
}

TARGET_CLASSES = ["crankshaft", "piston", "cylinder_block", "connecting_rod"]
CLASS_TO_ID = {c: i for i, c in enumerate(TARGET_CLASSES)}

def process():
    # Load pre-trained YOLOv8n (COCO) on CPU
    model = YOLO("yolov8n.pt")
    model.to("cpu")
    
    frames = list(FRAMES_DIR.glob("*.jpg"))
    print(f"Processing {len(frames)} frames on CPU...")
    
    count = 0
    for i, frame_path in enumerate(frames):
        if i % 50 == 0:
            print(f"  {i}/{len(frames)}...")
        
        img = cv2.imread(str(frame_path))
        if img is None:
            continue
        
        h, w = img.shape[:2]
        
        # Run inference on CPU
        results = model(frame_path, conf=0.25, verbose=False, device="cpu")
        
        labels = []
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                coco_class = model.names[cls_id]
                
                # Map to our classes
                if coco_class in COCO_TO_TARGET:
                    target_class = COCO_TO_TARGET[coco_class]
                    target_id = CLASS_TO_ID[target_class]
                    
                    # Convert to YOLO format
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    xc = (x1 + x2) / 2 / w
                    yc = (y1 + y2) / 2 / h
                    bw = (x2 - x1) / w
                    bh = (y2 - y1) / h
                    
                    # Filter reasonable box sizes
                    if 0.05 < bw < 0.9 and 0.05 < bh < 0.9:
                        labels.append(f"{target_id} {xc:.6f} {yc:.6f} {bw:.6f} {bh:.6f}")
        
        if labels:
            new_name = f"auto_{count:04d}.jpg"
            shutil.copy2(frame_path, OUTPUT_IMAGES / new_name)
            
            label_name = f"auto_{count:04d}.txt"
            (OUTPUT_LABELS / label_name).write_text("\n".join(labels))
            count += 1
    
    print(f"Auto-labeled: {count} frames with detections")
    
    # Create dataset.yaml
    yaml = f"""path: {Path('data/yolo_auto').absolute()}
train: images
val: images

nc: 4
names: {TARGET_CLASSES}
"""
    Path("data/yolo_auto/dataset.yaml").write_text(yaml)
    print("Created data/yolo_auto/dataset.yaml")
    print("\nNext: Verify in LabelImg")
    print(f"  labelimg {OUTPUT_IMAGES} {OUTPUT_LABELS}")

if __name__ == "__main__":
    process()