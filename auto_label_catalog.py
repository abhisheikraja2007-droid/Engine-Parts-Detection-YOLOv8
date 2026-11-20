#!/usr/bin/env python3
"""
Create a simplified YOLO dataset from catalog images with auto-generated labels.
Maps Maruti 800 folder names to 4 target classes.
Run: python auto_label_catalog.py
Then verify in LabelImg (just check boxes, minimal fixes).
"""
import shutil
from pathlib import Path
import cv2

CATALOG_ROOT = Path(r"G:\Maruti 800")
OUTPUT_IMAGES = Path("data/yolo_catalog/images")
OUTPUT_LABELS = Path("data/yolo_catalog/labels")
OUTPUT_IMAGES.mkdir(parents=True, exist_ok=True)
OUTPUT_LABELS.mkdir(parents=True, exist_ok=True)

# Map folder names to our 4 classes
FOLDER_TO_CLASS = {
    # Crankshaft
    "Crankshaft": 0,
    "Crankshaft pulley": 0,
    # Piston
    "Piston": 1,
    "Piston Ring": 1,
    "Piston pins (gudgeon pins)": 1,
    "Connecting rods": 1,
    "Connecting rod bearings": 1,
    # Cylinder Block
    "Cylinder Block": 2,
    "Cylinder Block (Bottom End)": 2,
    # Connecting Rod (separate class)
    "Connecting rods": 3,
    "Connecting rod bearings": 3,
}

CLASS_NAMES = ["crankshaft", "piston", "cylinder_block", "connecting_rod"]

def create_label_file(img_path, class_id, output_label_path):
    """Create a YOLO label assuming object fills ~80% of image center"""
    img = cv2.imread(str(img_path))
    if img is None:
        return False
    h, w = img.shape[:2]
    # Center box covering 80% of image
    x_center = 0.5
    y_center = 0.5
    box_w = 0.8
    box_h = 0.8
    with open(output_label_path, 'w') as f:
        f.write(f"{class_id} {x_center} {y_center} {box_w} {box_h}\n")
    return True

def process():
    count = 0
    for folder_name, class_id in FOLDER_TO_CLASS.items():
        folder_path = CATALOG_ROOT / folder_name
        if not folder_path.exists():
            # Try partial match
            matches = list(CATALOG_ROOT.rglob(folder_name))
            if matches:
                folder_path = matches[0]
            else:
                print(f"Folder not found: {folder_name}")
                continue
        
        images = list(folder_path.glob("*.jpg")) + list(folder_path.glob("*.png")) + list(folder_path.glob("*.jpeg"))
        print(f"{folder_name} ({CLASS_NAMES[class_id]}): {len(images)} images")
        
        for img_path in images:
            # Copy image
            new_name = f"{CLASS_NAMES[class_id]}_{count:04d}{img_path.suffix}"
            shutil.copy2(img_path, OUTPUT_IMAGES / new_name)
            
            # Create label
            label_name = f"{CLASS_NAMES[class_id]}_{count:04d}.txt"
            create_label_file(img_path, class_id, OUTPUT_LABELS / label_name)
            count += 1
    
    print(f"\nTotal: {count} images labeled")
    print(f"Images: {OUTPUT_IMAGES}")
    print(f"Labels: {OUTPUT_LABELS}")
    
    # Create dataset.yaml
    yaml = f"""path: {Path('data/yolo_catalog').absolute()}
train: images
val: images

nc: 4
names: {CLASS_NAMES}
"""
    Path("data/yolo_catalog/dataset.yaml").write_text(yaml)
    print("Created dataset.yaml")

if __name__ == "__main__":
    process()