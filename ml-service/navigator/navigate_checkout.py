import asyncio
import os
import re
from pathlib import Path
from playwright.async_api import async_playwright

VIEWPORTS = [
    {"name": "mobile", "width": 375, "height": 667},
    {"name": "tablet", "width": 768, "height": 1024},
    {"name": "desktop", "width": 1440, "height": 900},
]

def trim_scripts(html_content: str) -> str:
    """Removes <script> and <noscript> tags from HTML content to reduce prompt token size."""
    cleaned = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', html_content, flags=re.IGNORECASE)
    cleaned = re.sub(r'<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>', '', cleaned, flags=re.IGNORECASE)
    return cleaned.strip()

async def capture_page_snapshots(page, page_name: str, output_dir: Path) -> dict:
    """Captures full-page screenshots at 375, 768, and 1440px viewport widths and dumps trimmed HTML."""
    screenshot_paths = []

    # Capture HTML once (at initial viewport)
    html_content = await page.content()
    trimmed_html = trim_scripts(html_content)
    html_path = output_dir / f"{page_name}.html"
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(trimmed_html)

    # Capture screenshots across all defined viewport widths
    for vp in VIEWPORTS:
        width = vp["width"]
        height = vp["height"]
        await page.set_viewport_size({"width": width, "height": height})
        await page.wait_for_timeout(400)  # Allow CSS transitions and layout recalculations to settle

        screenshot_file = output_dir / f"{page_name}_{width}.png"
        await page.screenshot(path=str(screenshot_file), full_page=True)
        screenshot_paths.append(str(screenshot_file))

    return {
        "screenshot_paths": screenshot_paths,
        "html_path": str(html_path),
    }

async def run_navigation(base_url: str, run_id: str) -> dict:
    """
    Launches headless Chromium, navigates through the mock e-commerce app:
    Product Listing -> Add to Cart -> Cart Page -> Checkout Page.
    Captures full-page screenshots at widths 375, 768, 1440 and saves HTML.

    Returns:
        manifest dict: {page_name: {"screenshot_paths": [...], "html_path": str}}
    """
    # Normalize base URL (strip trailing slashes)
    base_url = base_url.rstrip("/")

    # Setup output directory
    output_dir = Path("runs") / run_id / "screenshots"
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        try:
            # 1. Product Listing Page
            print(f"[Navigator] Navigating to Product Listing: {base_url}/")
            await page.goto(f"{base_url}/", wait_until="networkidle", timeout=15000)
            await page.wait_for_selector("#product-grid", timeout=8000)
            manifest["product_listing"] = await capture_page_snapshots(page, "product_listing", output_dir)

            # Add first product to cart
            add_button = page.locator('button[id^="add-to-cart-"]').first
            if await add_button.count() > 0:
                await add_button.click()
                await page.wait_for_timeout(300)

            # 2. Cart Page
            print(f"[Navigator] Navigating to Cart Page: {base_url}/cart")
            await page.goto(f"{base_url}/cart", wait_until="networkidle", timeout=15000)
            await page.wait_for_selector("#cart-page", timeout=8000)
            manifest["cart"] = await capture_page_snapshots(page, "cart", output_dir)

            # 3. Checkout Page
            print(f"[Navigator] Navigating to Checkout Page: {base_url}/checkout")
            await page.goto(f"{base_url}/checkout", wait_until="networkidle", timeout=15000)
            await page.wait_for_selector("#checkout-page", timeout=8000)
            manifest["checkout"] = await capture_page_snapshots(page, "checkout", output_dir)

        finally:
            await browser.close()

    print(f"[Navigator] Navigation complete for run_id '{run_id}'. Manifest generated with {len(manifest)} pages.")
    return manifest
