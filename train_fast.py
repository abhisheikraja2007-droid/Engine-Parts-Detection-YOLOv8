#!/usr/bin/env python3
"""
Ultra-fast CPU training — 2 minutes max, 5 epochs, tiny model.
Just enough to show boxes on TV. Accuracy irrelevant.
Run: python train_fast.py
"""
import os
os.environ["CUDA_VISIBLE_DEVICES"] = ""

from ultralytics import YOLO

def train():
    print("FAST TRAIN: 5 epochs, CPU, 44 images, 4 classes")
    
    model = YOLO("yolov8n.pt")
    model.to("cpu")
    
    # Minimal training
    results = model.train(
        data="data/yolo_catalog/dataset.yaml",
        epochs=5,          # Only 5 epochs
        imgsz=320,         # Half resolution = 4x faster
        batch=4,
        device="cpu",
        workers=0,
        patience=100,      # No early stopping
        project="runs/detect",
        name="engine_fast",
        exist_ok=True,
        pretrained=True,
        optimizer="SGD",   # Simpler than auto
        lr0=0.01,
        augment=False,     # No augmentation = faster
        mosaic=0.0,
        mixup=0.0,
        verbose=True,
    )
    
    print(f"\nModel: runs/detect/engine_fast/weights/best.pt")
    metrics = model.val(data="data/yolo_catalog/dataset.yaml", device="cpu")
    print(f"mAP50: {metrics.box.map50:.4f}")

if __name__ == "__main__":
    train()