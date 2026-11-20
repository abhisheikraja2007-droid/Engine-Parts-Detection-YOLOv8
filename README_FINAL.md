# Engine Parts Detection — Real-Time TV Demo

## What You Have Now

| File | Purpose |
|------|---------|
| `best.pt` | Trained model (4 classes: crankshaft, piston, cylinder_block, connecting_rod) |
| `tv_demo.py` | **Run this on your Windows machine** — webcam → fullscreen TV |
| `data/yolo_catalog/` | Training data (44 clean catalog images) |
| `data/frames_raw/` | 552 video frames from Alto 800 rebuild |
| `train_fast.py` | 2-minute CPU training script |

## To Run the TV Demo

```cmd
cd D:\projects\Engine Detection
python tv_demo.py
```

**Controls:**
- `q` — Quit
- `f` — Toggle fullscreen (HDMI to TV)
- `s` — Save current frame

## What the Model Detects

| Class ID | Part | Color |
|----------|------|-------|
| 0 | crankshaft | Yellow |
| 1 | piston | Orange |
| 2 | cylinder_block | Blue |
| 3 | connecting_rod | Magenta |

## Training Details

- **Data**: 44 clean catalog images from `G:\Maruti 800\`
- **Epochs**: 5 (fast, ~2 min on CPU)
- **Resolution**: 320x320 (fast)
- **mAP50**: ~0.20 (low but functional for demo)
- **Device**: CPU (RTX 5050 not yet supported in PyTorch 2.5)

## To Improve Accuracy

1. **Better annotations**: Use LabelImg on video frames
   ```cmd
   labelimg data/frames_raw/ data/yolo_manual/labels/
   ```

2. **More epochs**: Change `epochs=5` to `epochs=50` in `train_fast.py`

3. **Full resolution**: Change `imgsz=320` to `imgsz=640`

4. **GPU training**: When PyTorch supports RTX 5050 (sm_120), remove `CUDA_VISIBLE_DEVICES=""`

## Project Structure

```
Engine Detection/
├── best.pt                 ← Trained model (copy to demo machine)
├── tv_demo.py              ← RUN THIS for TV demo
├── train_fast.py           ← 2-min training
├── extract_frames.py       ← Video → frames
├── auto_label_catalog.py   ← Auto-labels catalog images
├── auto_label_frames.py    ← Auto-labels video frames (COCO)
├── merge_datasets.py       ← Combines datasets
├── data/
│   ├── frames_raw/         ← 552 video frames
│   ├── yolo_catalog/       ← 44 catalog images + labels
│   ├── yolo_auto/          ← 29 auto-labeled frames
│   └── yolo_merged/        ← 73 combined images
└── test_output/            ← Saved webcam frames
```

## Demo Checklist

- [x] Model trained (4 classes)
- [x] TV demo script ready
- [x] Runs on CPU (no GPU issues)
- [x] Fullscreen HDMI output
- [ ] Test on actual engine parts (point webcam at engine)
- [ ] Verify detections visible on TV

---

**Next step**: Copy `D:\projects\Engine Detection\` to your demo machine, connect webcam + TV via HDMI, run `python tv_demo.py`.