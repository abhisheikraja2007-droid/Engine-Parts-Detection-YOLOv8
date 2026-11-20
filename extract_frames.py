#!/usr/bin/env python3
"""
Extract frames from milestone windows in the Alto 800 rebuild video.
Video is 41:35 min (2495s) at 30 FPS.
Run: python extract_frames.py
Outputs: data/frames_raw/ with frames named by milestone and timestamp
"""
import cv2
import os
from pathlib import Path

VIDEO_PATH = r"G:\vidssave.com Alto 800 Engine Rebuild _ Installing Crankshaft & Bearings _ Ultimate Guide! 480P.mp4"
OUTPUT_DIR = Path("data/frames_raw")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Actual milestones within 41:35 video (convert mm:ss to seconds)
MILESTONES = [
    ("preparation", 15*60, 25*60),      # 00:15 - 00:25  (block cleaning, grease)
    ("bearing_install", 40*60, 45*60),  # 00:40 - 00:45  (crankshaft + bearings) — adjusted to fit
    ("crankshaft_seating", 25*60, 30*60), # 00:25 - 00:30  (crankshaft goes in)
    ("piston_install", 30*60, 35*60),    # 00:30 - 00:35  (pistons/rods)
    ("final_assembly", 35*60, 41*60),    # 00:35 - 00:41  (covers, bolts, timing)
]

INTERVAL_SEC = 3  # every 3 seconds = ~10 frames per 30-sec window

def time_to_frame(cap, seconds):
    return int(seconds * cap.get(cv2.CAP_PROP_FPS))

def extract():
    cap = cv2.VideoCapture(VIDEO_PATH)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    print(f"Video: {fps} FPS, {total_frames} frames, {duration:.1f}s ({duration/60:.1f} min)")

    total_saved = 0
    for name, start_sec, end_sec in MILESTONES:
        if start_sec >= duration:
            print(f"\n{name}: SKIPPED (starts at {start_sec:.0f}s > video {duration:.0f}s)")
            continue
        end_sec = min(end_sec, duration)
        
        start_frame = time_to_frame(cap, start_sec)
        end_frame = time_to_frame(cap, end_sec)
        
        print(f"\n{name}: {start_sec//60:02.0f}:{start_sec%60:02.0f} - {end_sec//60:02.0f}:{end_sec%60:02.0f} "
              f"(frames {start_frame}-{end_frame})")
        
        frame_num = start_frame
        saved = 0
        while frame_num < end_frame:
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
            ret, frame = cap.read()
            if not ret:
                break
            
            ts_sec = frame_num / fps
            mm, ss = divmod(int(ts_sec), 60)
            hh, mm = divmod(mm, 60)
            fname = f"{name}_{hh:02d}{mm:02d}{ss:02d}.jpg"
            cv2.imwrite(str(OUTPUT_DIR / fname), frame)
            saved += 1
            frame_num += int(INTERVAL_SEC * fps)
        
        print(f"  Saved {saved} frames")
        total_saved += saved

    cap.release()
    print(f"\nTotal frames saved: {total_saved} in {OUTPUT_DIR}")

if __name__ == "__main__":
    extract()