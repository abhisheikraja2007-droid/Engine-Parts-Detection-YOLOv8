#!/usr/bin/env python3
"""
Quick start script for the Engine Parts Detection pipeline.
Run: python quickstart.py
"""
import subprocess
import sys
from pathlib import Path

def run(cmd, desc):
    print(f"\n{'='*60}")
    print(f"{desc}")
    print(f"Command: {cmd}")
    print(f"{'='*60}")
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        print(f"FAILED: {desc}")
        return False
    return True

def main():
    print("Engine Parts Detection - Quick Start")
    print("=====================================")
    
    # Check dataset
    dataset_yaml = Path("data/yolo_dataset/dataset.yaml")
    if not dataset_yaml.exists():
        print("\n[1/4] Creating dataset structure...")
        import create_dataset
    else:
        print("\n[1/4] Dataset structure exists ✓")
    
    # Check for annotations
    train_labels = list(Path("data/yolo_dataset/train/labels").glob("*.txt"))
    val_labels = list(Path("data/yolo_dataset/val/labels").glob("*.txt"))
    
    if not train_labels and not val_labels:
        print("\n[2/4] NO ANNOTATIONS FOUND!")
        print("You must annotate frames first:")
        print("  1. Run: label-studio start")
        print("  2. Open http://localhost:8080")
        print("  3. Create project → Import data/frames_raw/")
        print("  4. Annotate with classes from create_dataset.py")
        print("  5. Export YOLO format to data/yolo_dataset/")
        print("\nThen re-run this script.")
        return
    
    print(f"\n[2/4] Annotations found: {len(train_labels)} train, {len(val_labels)} val ✓")
    
    # Train
    print("\n[3/4] Training YOLOv8-nano...")
    if not run("python train.py", "Training"):
        return
    
    # Inference
    print("\n[4/4] Starting real-time detection (TV output)...")
    print("Press 'q' to quit, 'f' for fullscreen toggle")
    run("python infer_tv.py", "Real-time inference")

if __name__ == "__main__":
    main()