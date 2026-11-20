#!/usr/bin/env python3
"""
Train YOLOv8-nano on catalog dataset (4 classes, 44 images) — CPU mode.
Run: python train_catalog.py
"""
from ultralytics import YOLO
import torch

def train():
    device = "cpu"  # Force CPU for RTX 5050 compatibility
    print(f"Training on: {device} (RTX 5050 sm_120 not yet supported in PyTorch 2.5)")
    
    model = YOLO("yolov8n.pt")
    
    results = model.train(
        data="data/yolo_catalog/dataset.yaml",
        epochs=100,
        imgsz=640,
        batch=8,
        device=device,
        workers=2,
        patience=20,
        project="runs/detect",
        name="engine_catalog",
        exist_ok=True,
        pretrained=True,
        optimizer="auto",
        lr0=0.01,
        augment=True,
        mosaic=0.5,
        mixup=0.0,
    )
    
    print(f"\nBest model: runs/detect/engine_catalog/weights/best.pt")
    metrics = model.val(data="data/yolo_catalog/dataset.yaml")
    print(f"mAP50: {metrics.box.map50:.4f}")

if __name__ == "__main__":
    train()