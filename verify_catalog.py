#!/usr/bin/env python3
"""
Quick verification of auto-labeled catalog dataset.
Run: python verify_catalog.py
"""
import cv2
from pathlib import Path

IMAGES = Path("data/yolo_catalog/images")
LABELS = Path("data/yolo_catalog/labels")

def verify():
    images = list(IMAGES.glob("*.jpg")) + list(IMAGES.glob("*.png"))
    print(f"Total images: {len(images)}")
    
    for img_path in images[:5]:  # Check first 5
        label_path = LABELS / (img_path.stem + ".txt")
        if not label_path.exists():
            print(f"Missing label: {label_path}")
            continue
        
        img = cv2.imread(str(img_path))
        h, w = img.shape[:2]
        
        with open(label_path) as f:
            line = f.read().strip()
        cls_id, xc, yc, bw, bh = map(float, line.split())
        
        # Convert YOLO to pixel coords
        x1 = int((xc - bw/2) * w)
        y1 = int((yc - bh/2) * h)
        x2 = int((xc + bw/2) * w)
        y2 = int((yc + bh/2) * h)
        
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(img, f"Class {int(cls_id)}", (x1, y1-5), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        cv2.imwrite(f"verify_{img_path.stem}.jpg", img)
        print(f"Saved verify_{img_path.stem}.jpg - check visually")
    
    print("\nCheck the verify_*.jpg files - boxes should cover the part")

if __name__ == "__main__":
    verify()