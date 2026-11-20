#!/usr/bin/env python3
"""
Train YOLOv8-nano on merged dataset (catalog + auto-frames = 73 images).
Run: python train_merged.py
"""
import os
os.environ["CUDA_VISIBLE_DEVICES"] = ""  # Force CPU

from ultralytics import YOLO
import torch

def train():
    device = "cpu"
    print(f"Training on: {device} (73 images, 4 classes)")
    
    model = YOLO("yolov8n.pt")
    model.to(device)
    
    results = model.train(
        data="data/yolo_merged/dataset.yaml",
        epochs=100,
        imgsz=640,
        batch=8,
        device=device,
        workers=2,
        patience=20,
        project="runs/detect",
        name="engine_merged",
        exist_ok=True,
        pretrained=True,
        optimizer="auto",
        lr0=0.01,
        augment=True,
        mosaic=0.5,
        mixup=0.0,
    )
    
    print(f"\nBest model: runs/detect/engine_merged/weights/best.pt")
    metrics = model.val(data="data/yolo_merged/dataset.yaml")
    print(f"mAP50: {metrics.box.map50:.4f}")

if __name__ == "__main__":
    train()