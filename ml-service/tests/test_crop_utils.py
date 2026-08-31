import pytest
from pathlib import Path
from PIL import Image
from vlm_engine.crop_utils import crop_region, estimate_token_savings
from vlm_engine.analyze import analyze_screenshot

def test_estimate_token_savings():
    savings = estimate_token_savings((1440, 900), (375, 200))
    assert 80.0 <= savings <= 98.0
    print(f"\n[PASS] Test 1: estimate_token_savings calculated {savings}% token reduction.")

def test_crop_region_execution(tmp_path):
    # Create a temporary dummy image
    test_img = tmp_path / "sample.png"
    img = Image.new("RGB", (1000, 800), color="blue")
    img.save(test_img)

    crop_box = {"x": 100, "y": 150, "width": 300, "height": 200}
    cropped_path = crop_region(str(test_img), crop_box, padding=10)

    assert Path(cropped_path).exists()
    with Image.open(cropped_path) as cropped:
        assert cropped.width == 320  # 300 + 20 padding
        assert cropped.height == 220 # 200 + 20 padding
    print(f"[PASS] Test 2: crop_region successfully cropped image to {cropped.size} with padding.")

@pytest.mark.asyncio
async def test_analyze_screenshot_with_crop_box(tmp_path):
    test_img = tmp_path / "checkout.png"
    img = Image.new("RGB", (375, 667), color="white")
    img.save(test_img)

    result = await analyze_screenshot(
        image_path=str(test_img),
        dom_html="<html><body><button>Pay</button></body></html>",
        crop_box={"x": 50, "y": 500, "width": 275, "height": 50}
    )
    assert isinstance(result, dict)
    assert "has_issue" in result
    print("[PASS] Test 3: analyze_screenshot executes seamlessly with crop_box parameter.")
