import os
from PIL import Image

def optimize_images(directory, target_width=1920, quality=80):
    print(f"Scanning directory: {directory}")
    
    # Supported formats to convert
    extensions = ('.png', '.jpg', '.jpeg')
    
    for filename in os.listdir(directory):
        if filename.lower().endswith(extensions):
            file_path = os.path.join(directory, filename)
            
            # Skip if it's already a small file or if it's already webp
            # (though we only check extensions above)
            
            try:
                with Image.open(file_path) as img:
                    original_size = os.path.getsize(file_path)
                    
                    # Convert to RGB if necessary (e.g. for RGBA PNGs being saved as JPEG, but we want WebP)
                    # WebP supports Alpha, so we keep it if it's RGBA
                    
                    # Resize if wider than target_width
                    if img.width > target_width:
                        print(f"Resizing {filename} from {img.width}px to {target_width}px")
                        ratio = target_width / float(img.width)
                        new_height = int(float(img.height) * float(ratio))
                        img = img.resize((target_width, new_height), Image.Resampling.LANCZOS)
                    
                    # Target filename
                    name_without_ext = os.path.splitext(filename)[0]
                    webp_path = os.path.join(directory, f"{name_without_ext}.webp")
                    
                    # Save as WebP
                    img.save(webp_path, 'WEBP', quality=quality)
                    
                    new_size = os.path.getsize(webp_path)
                    reduction = (original_size - new_size) / original_size * 100
                    
                    print(f"Converted {filename}: {original_size/1024/1024:.2f}MB -> {new_size/1024/1024:.2f}MB ({reduction:.1f}% reduction)")
                    
            except Exception as e:
                print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    # Path to frontend public images
    target_dir = r"c:\laragon\www\desa_cimanggu_1\frontend\public\images"
    optimize_images(target_dir)
    print("Optimization complete.")
