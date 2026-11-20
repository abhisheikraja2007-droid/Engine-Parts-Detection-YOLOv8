#!/usr/bin/env python3
"""
Train YOLOv8-nano on the annotated engine parts dataset.
Run: python train.py
Outputs: runs/detect/train/weights/best.pt
"""
from ultralytics import YOLO
import torch

def train():
    # Check GPU
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Training on: {device}")
    if device == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")
    
    # Load YOLOv8-nano (fastest, ~3MB, 30+ FPS on RTX 3060)
    model = YOLO("yolov8n.pt")  # auto-downloads on first run
    
    # Train
    results = model.train(
        data="data/yolo_dataset/dataset.yaml",
        epochs=50,
        imgsz=640,
        batch=16,
        device=device,
        workers=4,
        patience=10,  # early stopping
        save_period=10,
        project="runs/detect",
        name="engine_parts",
        exist_ok=True,
        pretrained=True,
        optimizer="auto",
        lr0=0.01,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3,
        warmup_momentum=0.8,
        box=7.5,
        cls=0.5,
        dfl=1.5,
        augment=True,
        mosaic=1.0,
        mixup=0.1,
        copy_paste=0.1,
    )
    
    print("\nTraining complete!")
    print(f"Best model: runs/detect/engine_parts/weights/best.pt")
    print(f"Last model: runs/detect/engine_parts/weights/last.pt")
    
    # Validate
    metrics = model.val(data="data/yolo_dataset/dataset.yaml")
    print(f"\nmAP50: {metrics.box.map50:.4f}")
    print(f"mAP50-95: {metrics.box.map:.4f}")

if __name__ == "__main__":
    train()