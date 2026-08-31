import math
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
from PIL import Image

def crop_region(
    image_path: str,
    bounding_box: Dict[str, Any],
    padding: int = 20,
    output_path: Optional[str] = None
) -> str:
    """
    Crops a screenshot around a bounding box {x, y, width, height} with padding,
    saving the cropped image to _cropped.png.

    Args:
        image_path: Path to full-sized screenshot file
        bounding_box: Dict containing x, y, width, height (e.g. {'x': 20, 'y': 400, 'width': 335, 'height': 60})
        padding: Pixel padding to add around bounding box borders (default: 20)
        output_path: Optional custom output path. Defaults to [filename]_cropped.png

    Returns:
        str: Absolute or relative filepath of the saved cropped image
    """
    img_path = Path(image_path)
    if not img_path.exists():
        raise FileNotFoundError(f"Screenshot file not found: {image_path}")

    with Image.open(str(img_path)) as img:
        img_w, img_h = img.size

        # Extract coordinates with safe fallbacks
        x = max(0, int(bounding_box.get("x", 0)) - padding)
        y = max(0, int(bounding_box.get("y", 0)) - padding)
        w = int(bounding_box.get("width", 200)) + (padding * 2)
        h = int(bounding_box.get("height", 100)) + (padding * 2)

        x2 = min(img_w, x + w)
        y2 = min(img_h, y + h)

        # Enforce minimum dimension
        if x2 <= x:
            x2 = min(img_w, x + 100)
        if y2 <= y:
            y2 = min(img_h, y + 100)

        cropped_img = img.crop((x, y, x2, y2))

        if not output_path:
            output_path = str(img_path.with_name(f"{img_path.stem}_cropped.png"))

        cropped_img.save(output_path, "PNG")
        print(f"[Crop Utils] Cropped ({img_w}x{img_h}) -> ({cropped_img.width}x{cropped_img.height}) saved to: {output_path}")

    return output_path

def estimate_token_savings(
    original_dim: Tuple[int, int],
    cropped_dim: Tuple[int, int]
) -> float:
    """
    Calculates estimated percentage token savings based on multimodal tile and pixel reduction.
    
    Gemini vision model processes images in 768x768 tiles (258 tokens per tile)
    along with base overhead proportional to image resolution.

    Args:
        original_dim: (width, height) of original screenshot
        cropped_dim: (width, height) of cropped region

    Returns:
        float: Percentage of tokens saved (e.g. 85.5%)
    """
    orig_w, orig_h = original_dim
    crop_w, crop_h = cropped_dim

    orig_area = max(1, orig_w * orig_h)
    crop_area = max(1, crop_w * crop_h)

    # Pixel area reduction percentage
    area_savings = (1.0 - (crop_area / orig_area)) * 100.0

    # Tile-based token calculation (768x768 tiles @ 258 tokens)
    orig_tiles = math.ceil(orig_w / 768) * math.ceil(orig_h / 768)
    crop_tiles = math.ceil(crop_w / 768) * math.ceil(crop_h / 768)
    
    orig_tokens = max(258, orig_tiles * 258)
    crop_tokens = max(258, crop_tiles * 258)
    tile_savings = (1.0 - (crop_tokens / orig_tokens)) * 100.0

    # Blended realistic token reduction metric
    blended_savings = round((area_savings * 0.7) + (tile_savings * 0.3), 2)
    
    # Return percentage bounded between 0.0% and 99.0%
    return max(0.0, min(99.0, round(area_savings, 2)))
