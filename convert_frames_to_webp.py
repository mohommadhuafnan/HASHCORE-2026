"""
Frame Image Optimizer & WebP Converter for SEUSL HASHCORE '26
Converts all 240 high-resolution PNG frames into modern WebP format
to dramatically reduce bundle size by ~90% and supercharge website loading speed.
"""

import os
import sys
from pathlib import Path
from PIL import Image
from concurrent.futures import ThreadPoolExecutor, as_completed

def convert_single_frame(png_path: Path, output_dir: Path, quality: int = 85) -> tuple[str, int, int]:
    webp_name = png_path.stem + ".webp"
    webp_path = output_dir / webp_name
    
    orig_size = png_path.stat().st_size
    
    with Image.open(png_path) as img:
        # Convert to RGB if in RGBA mode and alpha is not needed, or keep RGBA
        if img.mode in ("RGBA", "LA") and not img.getchannel("A").getextrema()[0] < 255:
            # Fully opaque, RGB is even smaller
            img_to_save = img.convert("RGB")
        else:
            img_to_save = img
            
        img_to_save.save(
            webp_path,
            "WEBP",
            quality=quality,
            method=6, # Maximum compression effort
        )
        
    webp_size = webp_path.stat().st_size
    return (png_path.name, orig_size, webp_size)

def main():
    script_dir = Path(__file__).parent.resolve()
    candidate_paths = [
        script_dir / "src" / "frame",
        script_dir / "frontend" / "hashcode" / "src" / "frame",
    ]
    frames_dir = next((p for p in candidate_paths if p.exists()), None)
    
    if not frames_dir:
        print(f"Error: Frames directory not found in {candidate_paths}")
        sys.exit(1)
        
    png_files = sorted(list(frames_dir.glob("*.png")))
    total_files = len(png_files)
    
    if total_files == 0:
        print("No PNG frames found to convert.")
        sys.exit(0)
        
    print(f"=== HASHCORE '26 WebP Converter ===")
    print(f"Found {total_files} PNG frames to convert in {frames_dir}")
    print("Converting with quality=85, method=6 using multi-threaded acceleration...\n")
    
    total_orig_bytes = 0
    total_webp_bytes = 0
    completed = 0
    
    max_workers = min(16, (os.cpu_count() or 4) * 2)
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(convert_single_frame, p, frames_dir, 85): p
            for p in png_files
        }
        
        for future in as_completed(futures):
            name, orig_b, webp_b = future.result()
            total_orig_bytes += orig_b
            total_webp_bytes += webp_b
            completed += 1
            
            if completed % 20 == 0 or completed == total_files:
                pct = (completed / total_files) * 100
                print(f"[{completed}/{total_files}] ({pct:5.1f}%) converted... (latest: {name})")
                
    orig_mb = total_orig_bytes / (1024 * 1024)
    webp_mb = total_webp_bytes / (1024 * 1024)
    savings_pct = ((total_orig_bytes - total_webp_bytes) / total_orig_bytes) * 100
    
    print("\n" + "=" * 50)
    print("CONVERSION COMPLETE!")
    print(f"Original PNG Total: {orig_mb:.2f} MB")
    print(f"Optimized WebP Total: {webp_mb:.2f} MB")
    print(f"Data Saved: {orig_mb - webp_mb:.2f} MB ({savings_pct:.1f}% reduction!)")
    print("=" * 50)

if __name__ == "__main__":
    main()
