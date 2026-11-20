#!/usr/bin/env python3
"""
Create YOLO dataset structure from extracted frames + catalog images.
Run after manual annotation in Label Studio.
Structure:
  data/
    train/images/
    train/labels/
    val/images/
    val/labels/
    dataset.yaml
"""
import os
import shutil
from pathlib import Path
import random

# Classes we want to detect (adjust based on what you'll annotate)
CLASSES = [
    "crankshaft",
    "main_bearing",
    "connecting_rod",
    "piston",
    "piston_ring",
    "cylinder_block",
    "timing_gear",
    "oil_pump",
    "water_pump",
    "alternator",
    "spark_plug",
    "oil_filter",
    "radiator",
    "thermostat",
    "flywheel",
    "torque_wrench",  # tool detection for assembly verification
]

FRAMES_DIR = Path("data/frames_raw")
CATALOG_DIR = Path(r"G:\Maruti 800")
OUTPUT_DIR = Path("data/yolo_dataset")

def create_structure():
    for split in ["train", "val"]:
        (OUTPUT_DIR / split / "images").mkdir(parents=True, exist_ok=True)
        (OUTPUT_DIR / split / "labels").mkdir(parents=True, exist_ok=True)
    
    # dataset.yaml
    yaml_content = f"""path: {OUTPUT_DIR.absolute()}
train: train/images
val: val/images

nc: {len(CLASSES)}
names: {CLASSES}
"""
    (OUTPUT_DIR / "dataset.yaml").write_text(yaml_content)
    print(f"Created dataset structure at {OUTPUT_DIR}")

def copy_catalog_images():
    """Copy catalog images as additional training data (unlabeled, for background/augmentation)"""
    # This is optional - catalog images are clean single-part shots
    # Better to use them as reference, not training data (domain gap)
    pass

if __name__ == "__main__":
    create_structure()
    print("\nNext steps:")
    print("1. Open Label Studio: label-studio start")
    print("2. Import frames from data/frames_raw/")
    print("3. Annotate with classes:", CLASSES)
    print("4. Export YOLO format to data/yolo_dataset/")
    print("5. Run train.py")