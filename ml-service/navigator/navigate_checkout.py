import asyncio
import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

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

def capture_page_snapshots_sync(page, page_name: str, output_dir: Path) -> dict:
    """Synchronous snapshot capture across all viewports."""
    screenshot_paths = []

    # Capture HTML once (at initial viewport)
    html_content = page.content()
    trimmed_html = trim_scripts(html_content)
    html_path = output_dir / f"{page_name}.html"
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(trimmed_html)

    # Capture screenshots across all defined viewport widths
    for vp in VIEWPORTS:
        width = vp["width"]
        height = vp["height"]
        page.set_viewport_size({"width": width, "height": height})
        page.wait_for_timeout(400)

        screenshot_file = output_dir / f"{page_name}_{width}.png"
        page.screenshot(path=str(screenshot_file), full_page=True)
        screenshot_paths.append(str(screenshot_file))

    return {
        "screenshot_paths": screenshot_paths,
        "html_path": str(html_path),
    }

def _sync_run_navigation(base_url: str, run_id: str) -> dict:
    """
    Synchronous navigation loop running in a dedicated thread.
    Immune to Windows asyncio event loop / SelectorEventLoop restrictions.
    """
    base_url = base_url.rstrip("/")
    output_dir = Path("runs") / run_id / "screenshots"
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Product Listing Page
            print(f"[Navigator] Navigating to Product Listing: {base_url}/")
            page.goto(f"{base_url}/", wait_until="networkidle", timeout=15000)
            page.wait_for_selector("#product-grid", timeout=8000)
            manifest["product_listing"] = capture_page_snapshots_sync(page, "product_listing", output_dir)

            # Add first product to cart
            add_button = page.locator('button[id^="add-to-cart-"]').first
            if add_button.count() > 0:
                add_button.click()
                page.wait_for_timeout(300)

            # 2. Cart Page
            print(f"[Navigator] Navigating to Cart Page: {base_url}/cart")
            page.goto(f"{base_url}/cart", wait_until="networkidle", timeout=15000)
            page.wait_for_selector("#cart-page", timeout=8000)
            manifest["cart"] = capture_page_snapshots_sync(page, "cart", output_dir)

            # 3. Checkout Page
            print(f"[Navigator] Navigating to Checkout Page: {base_url}/checkout")
            page.goto(f"{base_url}/checkout", wait_until="networkidle", timeout=15000)
            page.wait_for_selector("#checkout-page", timeout=8000)
            manifest["checkout"] = capture_page_snapshots_sync(page, "checkout", output_dir)

        finally:
            browser.close()

    print(f"[Navigator] Navigation complete for run_id '{run_id}'. Manifest generated with {len(manifest)} pages.")
    return manifest

async def run_navigation(base_url: str, run_id: str) -> dict:
    """Async wrapper executing synchronous Playwright inside an asyncio worker thread."""
    return await asyncio.to_thread(_sync_run_navigation, base_url, run_id)
