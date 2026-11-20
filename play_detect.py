#!/usr/bin/env python3
"""
Simple Video Player with Live Detection
Run: python play_detect.py

Features:
- Drag & drop or select video file
- Plays video with detection overlay
- Simple UI: play/pause, seek, file select
- Shows bounding boxes + part names live
"""
import cv2
import os
os.environ["CUDA_VISIBLE_DEVICES"] = ""

from ultralytics import YOLO
from pathlib import Path
import tkinter as tk
from tkinter import filedialog
import threading
import time

MODEL_PATH = Path(r"D:\projects\Engine Detection\best_full.pt")

CLASS_NAMES = ["crankshaft", "piston", "cylinder_block", "connecting_rod"]
COLORS = {
    0: (0, 255, 255),   # crankshaft
    1: (255, 128, 0),   # piston
    2: (0, 128, 255),   # cylinder_block
    3: (255, 0, 255),   # connecting_rod
}

class VideoDetector:
    def __init__(self):
        self.model = YOLO(str(MODEL_PATH))
        self.model.to("cpu")
        
        self.cap = None
        self.playing = False
        self.frame = None
        self.detected_frame = None
        self.total_frames = 0
        self.current_frame = 0
        self.fps = 30
        self.video_path = None
        
        # UI
        self.root = tk.Tk()
        self.root.title("Engine Parts Detection - Video Player")
        self.root.geometry("1000x700")
        
        # Video canvas
        self.canvas = tk.Canvas(self.root, bg="black", width=960, height=540)
        self.canvas.pack(pady=10)
        
        # Controls frame
        controls = tk.Frame(self.root)
        controls.pack(pady=5)
        
        self.btn_file = tk.Button(controls, text="📁 Open Video", command=self.open_video, width=15)
        self.btn_file.pack(side=tk.LEFT, padx=5)
        
        self.btn_play = tk.Button(controls, text="▶ Play", command=self.toggle_play, width=10)
        self.btn_play.pack(side=tk.LEFT, padx=5)
        
        self.btn_stop = tk.Button(controls, text="⏹ Stop", command=self.stop_video, width=10)
        self.btn_stop.pack(side=tk.LEFT, padx=5)
        
        # Seek bar
        self.seek_var = tk.DoubleVar()
        self.seek_bar = tk.Scale(self.root, from_=0, to=100, orient=tk.HORIZONTAL, 
                                 variable=self.seek_var, length=900, command=self.on_seek)
        self.seek_bar.pack(pady=5)
        
        # Status label
        self.status = tk.Label(self.root, text="No video loaded", fg="gray")
        self.status.pack(pady=5)
        
        # Detection counts
        self.counts_label = tk.Label(self.root, text="", font=("Consolas", 10))
        self.counts_label.pack(pady=2)
        
        # Start UI update loop
        self.update_ui()
        self.root.mainloop()
    
    def open_video(self):
        path = filedialog.askopenfilename(
            title="Select Video",
            filetypes=[("Video files", "*.mp4 *.avi *.mov *.mkv"), ("All files", "*.*")]
        )
        if not path:
            return
        
        if self.cap:
            self.cap.release()
        
        self.cap = cv2.VideoCapture(path)
        if not self.cap.isOpened():
            self.status.config(text="Failed to open video")
            return
        
        self.video_path = path
        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.fps = self.cap.get(cv2.CAP_PROP_FPS) or 30
        self.current_frame = 0
        
        # Read first frame
        ret, frame = self.cap.read()
        if ret:
            self.frame = frame
            self.process_frame()
            self.show_frame()
        
        self.seek_bar.config(to=self.total_frames)
        self.status.config(text=f"Loaded: {Path(path).name} ({self.total_frames} frames @ {self.fps:.1f} FPS)")
        self.playing = False
        self.btn_play.config(text="▶ Play")
    
    def toggle_play(self):
        if not self.cap:
            return
        self.playing = not self.playing
        self.btn_play.config(text="⏸ Pause" if self.playing else "▶ Play")
    
    def stop_video(self):
        self.playing = False
        self.btn_play.config(text="▶ Play")
        if self.cap:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            self.current_frame = 0
            ret, frame = self.cap.read()
            if ret:
                self.frame = frame
                self.process_frame()
                self.show_frame()
            self.seek_var.set(0)
    
    def on_seek(self, value):
        if not self.cap:
            return
        frame_num = int(float(value))
        if 0 <= frame_num < self.total_frames:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
            self.current_frame = frame_num
            ret, frame = self.cap.read()
            if ret:
                self.frame = frame
                self.process_frame()
                self.show_frame()
    
    def process_frame(self):
        if self.frame is None:
            return
        results = self.model(self.frame, conf=0.25, verbose=False, device="cpu")
        
        # Count detections
        counts = {name: 0 for name in CLASS_NAMES}
        
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                
                if cls_id >= len(CLASS_NAMES):
                    continue
                
                counts[CLASS_NAMES[cls_id]] += 1
                color = COLORS.get(cls_id, (255, 255, 255))
                label = f"{CLASS_NAMES[cls_id]} {conf:.2f}"
                
                cv2.rectangle(self.frame, (x1, y1), (x2, y2), color, 2)
                (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                cv2.rectangle(self.frame, (x1, y1 - th - 8), (x1 + tw + 8, y1), color, -1)
                cv2.putText(self.frame, label, (x1 + 4, y1 - 4),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
        
        # Update counts display
        counts_text = "  |  ".join(f"{name}: {count}" for name, count in counts.items())
        self.counts_label.config(text=counts_text)
        
        self.detected_frame = self.frame.copy()
    
    def show_frame(self):
        if self.detected_frame is None:
            return
        
        # Resize to fit canvas
        h, w = self.detected_frame.shape[:2]
        canvas_w, canvas_h = 960, 540
        scale = min(canvas_w / w, canvas_h / h)
        new_w, new_h = int(w * scale), int(h * scale)
        
        resized = cv2.resize(self.detected_frame, (new_w, new_h))
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        
        # Convert to PhotoImage
        import PIL.Image, PIL.ImageTk
        img = PIL.Image.fromarray(rgb)
        self.photo = PIL.ImageTk.PhotoImage(img)
        
        # Center on canvas
        self.canvas.delete("all")
        self.canvas.create_image(canvas_w // 2, canvas_h // 2, image=self.photo, anchor=tk.CENTER)
    
    def update_ui(self):
        if self.playing and self.cap:
            ret, frame = self.cap.read()
            if ret:
                self.current_frame += 1
                self.frame = frame
                self.process_frame()
                self.show_frame()
                self.seek_var.set(self.current_frame)
                
                # Loop video
                if self.current_frame >= self.total_frames:
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    self.current_frame = 0
            else:
                self.playing = False
                self.btn_play.config(text="▶ Play")
        
        # Schedule next update
        delay = int(1000 / self.fps) if self.fps > 0 else 33
        self.root.after(delay, self.update_ui)


if __name__ == "__main__":
    if not MODEL_PATH.exists():
        print(f"Model not found: {MODEL_PATH}")
        input("Press Enter to exit...")
    else:
        VideoDetector()