#!/usr/bin/env python3
"""
Combine all datasets: catalog + auto-labeled frames + manual labels
Run: python prepare_full_dataset.py
"""
import shutil
from pathlib import Path

# Source directories
CATALOG_IMG = Path("data/yolo_catalog/images")
CATALOG_LBL = Path("data/yolo_catalog/labels")
AUTO_IMG = Path("data/yolo_auto/images")
AUTO_LBL = Path("data/yolo_auto/labels")
MANUAL_IMG = Path("data/yolo_manual/images")
MANUAL_LBL = Path("data/yolo_manual/labels")

# Output
OUT_IMG = Path("data/yolo_full/images")
OUT_LBL = Path("data/yolo_full/labels")
OUT_IMG.mkdir(parents=True, exist_ok=True)
OUT_LBL.mkdir(parents=True, exist_ok=True)

def copy_with_prefix(src_img, src_lbl, prefix, count):
    copied = 0
    for img in sorted(src_img.glob("*")):
        lbl = src_lbl / (img.stem + ".txt")
        if lbl.exists():
            new_name = f"{prefix}_{count:04d}{img.suffix}"
            shutil.copy2(img, OUT_IMG / new_name)
            shutil.copy2(lbl, OUT_LBL / f"{prefix}_{count:04d}.txt")
            count += 1
            copied += 1
    return count, copied

def main():
    count = 0
    total = 0
    
    # 1. Catalog (clean, high quality)
    count, c = copy_with_prefix(CATALOG_IMG, CATALOG_LBL, "cat", count)
    total += c
    print(f"Catalog: {c} images")
    
    # 2. Auto-labeled frames (from video via COCO)
    count, c = copy_with_prefix(AUTO_IMG, AUTO_LBL, "auto", count)
    total += c
    print(f"Auto-labeled: {c} images")
    
    # 3. Manual labels (if any)
    if MANUAL_IMG.exists():
        count, c = copy_with_prefix(MANUAL_IMG, MANUAL_LBL, "man", count)
        total += c
        print(f"Manual: {c} images")
    else:
        print("Manual: 0 images (folder doesn't exist)")
    
    print(f"\nTotal: {total} images")
    
    # dataset.yaml
    yaml = f"""path: {Path('data/yolo_full').absolute()}
train: images
val: images

nc: 4
names: ["crankshaft", "piston", "cylinder_block", "connecting_rod"]
"""
    Path("data/yolo_full/dataset.yaml").write_text(yaml)
    print("Created data/yolo_full/dataset.yaml")
    
    # Verify
    print("\nVerification:")
    for name in ["crankshaft", "piston", "cylinder_block", "connecting_rod"]:
        lbl_count = len(list(OUT_LBL.glob(f"*{name}*.txt")))
        print(f"  {name}: {lbl_count} labels")

if __name__ == "__main__":
    main()