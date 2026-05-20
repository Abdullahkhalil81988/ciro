import os
import sys
import shutil
import subprocess
from PIL import Image

def convert_webp_to_mp4(webp_path, mp4_path, fps=12):
    temp_dir = webp_path + "_frames"
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)

    try:
        im = Image.open(webp_path)
        frame_idx = 0
        while True:
            frame_path = os.path.join(temp_dir, f"frame_{frame_idx:05d}.png")
            rgb_im = im.convert("RGB")
            rgb_im.save(frame_path, "PNG")
            frame_idx += 1
            try:
                im.seek(im.tell() + 1)
            except EOFError:
                break
        
        print(f"Extracted {frame_idx} frames from {webp_path}")

        # Stitch frames into standard h264 MP4 with yuv420p pixel format
        cmd = [
            "ffmpeg", "-y",
            "-r", str(fps),
            "-i", os.path.join(temp_dir, "frame_%05d.png"),
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            mp4_path
        ]
        print(f"Running ffmpeg command: {' '.join(cmd)}")
        subprocess.run(cmd, check=True)
        print(f"Successfully created {mp4_path}")

    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python convert_webp_to_mp4.py <input.webp> <output.mp4> [fps]")
        sys.exit(1)
    
    webp = sys.argv[1]
    mp4 = sys.argv[2]
    fps = int(sys.argv[3]) if len(sys.argv) > 3 else 12
    convert_webp_to_mp4(webp, mp4, fps)
