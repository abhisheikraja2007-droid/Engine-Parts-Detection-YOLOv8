#!/usr/bin/env python3
"""
Train on full dataset (catalog + auto-labeled frames)
Run: python train_full.py
"""
import os
os.environ["CUDA_VISIBLE_DEVICES"] = ""

from ultralytics import YOLO

def train():
    print("Training on full dataset (73 images, 4 classes)")
    
    model = YOLO("yolov8n.pt")
    model.to("cpu")
    
    results = model.train(
        data="data/yolo_full/dataset.yaml",
        epochs=50,
        imgsz=640,
        batch=8,
        device="cpu",
        workers=2,
        patience=15,
        project="runs/detect",
        name="engine_full",
        exist_ok=True,
        pretrained=True,
        optimizer="SGD",
        lr0=0.01,
        augment=True,
        mosaic=0.5,
        mixup=0.0,
        close_mosaic=10,
    )
    
    print(f"\nBest model: runs/detect/engine_full/weights/best.pt")
    metrics = model.val(data="data/yolo_full/dataset.yaml", device="cpu")
    print(f"mAP50: {metrics.box.map50:.4f}")
    print(f"mAP50-95: {metrics.box.map:.4f}")

if __name__ == "__main__":
    train()