# Engine Parts Detection

Real-time engine component detection for TV display. Built from Maruti 800 / Alto 800 rebuild video.

## Pipeline Overview

```
Alto 800 rebuild video (41 min)
       ↓
extract_frames.py → 552 frames across 5 assembly phases
       ↓
Label Studio annotation (YOL0 format)
       ↓
train.py → YOLOv8-nano (best.pt ~3MB)
       ↓
infer_tv.py → Webcam → Fullscreen HDMI → TV
```

## Quick Start

```bash
# 1. Extract frames (done)
python extract_frames.py

# 2. Create dataset structure (done)
python create_dataset.py

# 3. ANNOTATE - Critical step!
label-studio start
# Open http://localhost:8080
# Create project → Object Detection
# Import data/frames_raw/
# Annotate with 16 classes
# Export → YOLO → data/yolo_dataset/

# 4. Train
python train.py

# 5. Real-time detection on TV
python infer_tv.py
```

## Classes (16)

| Part | Tool |
|------|------|
| crankshaft | torque_wrench |
| main_bearing | |
| connecting_rod | |
| piston | |
| piston_ring | |
| cylinder_block | |
| timing_gear | |
| oil_pump | |
| water_pump | |
| alternator | |
| spark_plug | |
| oil_filter | |
| radiator | |
| thermostat | |
| flywheel | |

## Controls (infer_tv.py)

| Key | Action |
|-----|--------|
| `q` | Quit |
| `f` | Toggle fullscreen |
| `s` | Save annotated frame |
| `c` | Toggle confidence display |

## Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| GPU | GTX 1650 (4GB) | RTX 3060 (12GB) / Jetson Orin |
| RAM | 8 GB | 16 GB |
| Camera | 720p30 USB | 1080p60 / MIPI CSI |
| Display | HDMI 1080p | 4K TV |

## Performance Targets

- **Model**: YOLOv8-nano (3.2M params)
- **Inference**: ~8ms/frame on RTX 3060 (125 FPS)
- **End-to-end**: ~30 FPS with camera + display
- **mAP50 target**: >0.75 on engine parts

## Data Sources

- **Video**: `G:\vidssave.com Alto 800 Engine Rebuild...` (41 min, 854x480)
- **Catalog images**: `G:\Maruti 800\` (89 reference photos, 11 categories)
- **Labels**: `data/frames_raw/` (552 extracted frames)

## Project Structure

```
Engine Detection/
├── extract_frames.py      # Frame extraction from video
├── create_dataset.py      # YOLO dataset structure
├── train.py               # YOLOv8 training
├── infer_tv.py            # Real-time TV output
├── quickstart.py          # Guided pipeline
├── data/
│   ├── frames_raw/        # 552 extracted frames
│   └── yolo_dataset/      # YOLO train/val (after annotation)
├── runs/detect/engine_parts/weights/best.pt  # Trained model
└── requirements.txt
```

## Annotation Tips (Label Studio)

1. **Focus on visible parts** - only label what's clearly visible
2. **Tight boxes** - snug to part edges
3. **Occlusion** - label partially visible parts, use "difficult" flag
4. **Consistency** - same part = same class always
5. **Minimum 20 instances per class** for usable detection

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Camera not opening | Change `CAMERA_INDEX` in infer_tv.py (0, 1, 2...) |
| Low FPS | Lower `imgsz` in train.py, reduce camera resolution |
| Poor detection | More annotations, check class balance, increase epochs |
| Model not found | Run `train.py` first, or download `yolov8n.pt` |

## Demo Checklist

- [ ] 200+ annotated frames across all 16 classes
- [ ] mAP50 > 0.70 on validation set
- [ ] Real-time 30 FPS on demo hardware
- [ ] Clean fullscreen HDMI output to TV
- [ ] Demo script: point camera at engine parts → TV shows labels

---

**Next action**: Run `label-studio start` and begin annotation.