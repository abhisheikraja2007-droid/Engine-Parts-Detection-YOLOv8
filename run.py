#!/usr/bin/env python3
"""
Engine Parts Detection - Unified Launcher
Run: python run.py
"""
import os
os.environ["CUDA_VISIBLE_DEVICES"] = ""

import sys
sys.path.insert(0, r"D:\projects\Engine Detection")

def menu():
    print("""
╔═══════════════════════════════════════════════════════════╗
║         ENGINE PARTS DETECTION - LAUNCHER                  ║
╠═══════════════════════════════════════════════════════════╣
║  1. Live TV Demo (simple, fullscreen)                      ║
║     → Webcam → Fullscreen HDMI → TV                        ║
║     → Run: python tv_demo.py                               ║
║                                                            ║
║  2. Advanced UI (side panel log, video + webcam)           ║
║     → Switch between webcam/video (c/v)                    ║
║     → Side panel: counts, timestamps, recent detections    ║
║     → Run: python detect_ui.py                             ║
║                                                            ║
║  3. Process Video File (save output with boxes)            ║
║     → Input: test.mp4 → Output: test_output.mp4            ║
║     → Run: python test_video.py                            ║
║                                                            ║
║  4. Fast Training (2 min, CPU, 4 classes)                  ║
║     → Retrain model on catalog images                      ║
║     → Run: python train_fast.py                            ║
║                                                            ║
║  q. Quit                                                   ║
╚═══════════════════════════════════════════════════════════╝
""")

def run_choice(choice):
    if choice == '1':
        import tv_demo
        tv_demo.main()
    elif choice == '2':
        import detect_ui
        detect_ui.main()
    elif choice == '3':
        import test_video
        test_video.main()
    elif choice == '4':
        import train_fast
        train_fast.train()
    else:
        print("Invalid choice")

def main():
    while True:
        menu()
        choice = input("Select mode (1-4, q): ").strip().lower()
        if choice == 'q':
            break
        if choice in ('1', '2', '3', '4'):
            try:
                run_choice(choice)
            except KeyboardInterrupt:
                print("\nInterrupted")
            except Exception as e:
                print(f"Error: {e}")
        else:
            print("Invalid choice")

if __name__ == "__main__":
    main()