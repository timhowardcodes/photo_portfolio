import os
from PIL import Image, ImageStat, ImageChops
from exiftool import ExifToolHelper

EXIFTOOL_PATH = r"D:\Coding\Dev_Tools\exiftool-13.06_64\exiftool(-k).exe"

def get_image_orientation(filepath):
    # Open the image
    with Image.open(filepath) as img:
        # Get image dimensions
        width, height = img.size
        # Determine orientation
        if width > height:
            print("Image is Horizontal")
            return "Horizontal"
        elif width < height:
            print("Image is Vertical")
            return "Vertical"
        else:
            print("Image is Square")
            return "Square"
        

def black_white_check(filepath):
    image = Image.open(filepath)
    
    # Quick check: if already in grayscale mode
    if image.mode in ('L', '1', 'LA'):
        return True
    
    # For RGB images, check if channels are identical
    if image.mode == 'RGB':
        r, g, b = image.split()
        
        # Compare channels using ImageChops
        if ImageChops.difference(r, g).getextrema()[1] != 0:
            return False
        if ImageChops.difference(r, b).getextrema()[1] != 0:
            return False
        
        return True
    
    return False


def determine_watermark_color(file_path):
    img = Image.open(file_path)
    width, height = img.size
    
    # Crop bottom right sixteenth
    quadrant = img.crop(((width // 4) * 3, (height // 4) * 3, width, height))
    
    # Convert to grayscale and get average brightness
    gray_quadrant = quadrant.convert('L')
    stat = ImageStat.Stat(gray_quadrant)
    avg_brightness = stat.mean[0]
    
    # Return appropriate watermark color
    return 'white' if avg_brightness < 127 else 'black'


def get_metadata(full_path):
    with ExifToolHelper(executable=EXIFTOOL_PATH) as et:
        for d in et.get_metadata(full_path):
			# Get keywords (XMP Subject)
            # keywords = d["XMP:Subject"]
            # state.IPTC_tags = ', '.join(keywords)

			# Get the caption (IPTC Caption-Abstract)
            img_caption = d.get("IPTC:Caption-Abstract", d.get("IPTC:ObjectName", ""))
            copyright = d.get("IPTC:CopyrightNotice", "")
            return {"IPTC:Caption-Abstract": img_caption, "IPTC:CopyrightNotice": copyright}
    return {}

def apply_metadata(file_path, metadata):
    if not metadata:
        return
    with ExifToolHelper(executable=EXIFTOOL_PATH) as et:
        et.set_tags(file_path, metadata, params=["-overwrite_original"])



def process_images_with_watermark(folder_path):
    # Define watermark paths
    watermark_black_path = r"D:\Etsy\Store\Signature watermark black.png"
    watermark_white_path = r"D:\Etsy\Store\Signature watermark white.png"

    # Define output folder
    output_folder = os.path.join(folder_path, "Resized")
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        
    thumbs_folder = os.path.join(folder_path, "Thumbs")
    if not os.path.exists(thumbs_folder):
        os.makedirs(thumbs_folder)

    # List all JPEG images
    files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg'))]

    for file in files:
        full_path = os.path.join(folder_path, file)
        
        try:
            # Determine watermark color
            wm_color = determine_watermark_color(full_path)
            wm_path = watermark_black_path if wm_color == 'black' else watermark_white_path
            
            metadata = get_metadata(full_path)

            with Image.open(full_path) as img:
                # Resize image
                target_long_edge = 3000
                width, height = img.size
                
                if width > height:
                    new_width = target_long_edge
                    new_height = int(height * (target_long_edge / width))
                else:
                    new_height = target_long_edge
                    new_width = int(width * (target_long_edge / height))
                
                # Handle resampling method compatibility
                if hasattr(Image, 'Resampling'):
                    resample = Image.Resampling.LANCZOS
                else:
                    resample = Image.LANCZOS
                
                resized_img = img.resize((new_width, new_height), resample)
                
                # Apply watermark
                with Image.open(wm_path) as wm:
                    # Resize watermark
                    wm_width, wm_height = wm.size
                    if new_height > new_width:
                        target_wm_long = int(target_long_edge * 0.12)
                    else:
                        target_wm_long = int(target_long_edge * 0.10)
                    
                    if wm_width > wm_height:
                        new_wm_w = target_wm_long
                        new_wm_h = int(wm_height * (target_wm_long / wm_width))
                    else:
                        new_wm_h = target_wm_long
                        new_wm_w = int(wm_width * (target_wm_long / wm_height))
                    
                    wm = wm.resize((new_wm_w, new_wm_h), resample)
                    
                    # Calculate padding (10% of resized dimensions)
                    pad_x = int(new_width * 0.05)
                    pad_y = pad_x
                    
                    wm_width, wm_height = wm.size
                    
                    # Calculate position (bottom right with padding)
                    pos_x = new_width - wm_width - pad_x
                    pos_y = new_height - wm_height - pad_y
                    
                    # Paste watermark using itself as mask (for transparency)
                    resized_img.paste(wm, (pos_x, pos_y), wm)
                

                # Save image
                save_path = os.path.join(output_folder, file)
                resized_img.save(save_path, quality=80)
                print(f"Processed: {file}")
                apply_metadata(save_path, metadata)
                
                # Create thumbnail
                thumb_width = 1100
                w, h = resized_img.size
                thumb_height = int(h * (thumb_width / w))
                thumb_img = resized_img.resize((thumb_width, thumb_height), resample)
    
                
                base_name, ext = os.path.splitext(file)
                thumb_path = os.path.join(thumbs_folder, f"{base_name}_thumb{ext}")
                thumb_img.save(thumb_path, quality=80)
                apply_metadata(thumb_path, metadata)
                
        except Exception as e:
            print(f"Failed to process {file}: {e}")

    print("Process complete.")


folder_path = r"D:\Coding\Python\my-portfolio\src\assets\pending_photos\high_quality"
process_images_with_watermark(folder_path)