#!/usr/bin/env python3
"""
Merge catalog + auto-frames datasets for stronger training.
Run: python merge_datasets.py
"""
import shutil
from pathlib import Path

CATALOG_IMG = Path("data/yolo_catalog/images")
CATALOG_LBL = Path("data/yolo_catalog/labels")
AUTO_IMG = Path("data/yolo_auto/images")
AUTO_LBL = Path("data/yolo_auto/labels")

MERGED_IMG = Path("data/yolo_merged/images")
MERGED_LBL = Path("data/yolo_merged/labels")
MERGED_IMG.mkdir(parents=True, exist_ok=True)
MERGED_LBL.mkdir(parents=True, exist_ok=True)

def merge():
    count = 0
    
    # Copy catalog
    for img in CATALOG_IMG.glob("*"):
        lbl = CATALOG_LBL / (img.stem + ".txt")
        if lbl.exists():
            shutil.copy2(img, MERGED_IMG / f"cat_{count:04d}{img.suffix}")
            shutil.copy2(lbl, MERGED_LBL / f"cat_{count:04d}.txt")
            count += 1
    
    # Copy auto-frames
    for img in AUTO_IMG.glob("*"):
        lbl = AUTO_LBL / (img.stem + ".txt")
        if lbl.exists():
            shutil.copy2(img, MERGED_IMG / f"auto_{count:04d}{img.suffix}")
            shutil.copy2(lbl, MERGED_LBL / f"auto_{count:04d}.txt")
            count += 1
    
    print(f"Merged: {count} images")
    
    # dataset.yaml
    yaml = f"""path: {Path('data/yolo_merged').absolute()}
train: images
val: images

nc: 4
names: ["crankshaft", "piston", "cylinder_block", "connecting_rod"]
"""
    Path("data/yolo_merged/dataset.yaml").write_text(yaml)
    print("Created data/yolo_merged/dataset.yaml")

if __name__ == "__main__":
    merge()