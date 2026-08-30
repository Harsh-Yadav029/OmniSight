import os
import json
import re
import asyncio
from typing import Optional, Dict, Any
from pathlib import Path
from PIL import Image
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

class VLMResponse(BaseModel):
    has_issue: bool = Field(..., description="Whether any visual defect is detected in the screenshot")
    issue_type: str = Field(default="", description="Category of the visual issue (e.g., clipped element, overlapping text, hidden button)")
    description: str = Field(default="", description="Detailed description of the visual bug observed")
    affected_selector: str = Field(default="", description="CSS or JSX selector/element identifier affected (e.g. #submit-order-button, button[type='submit'])")
    suggested_tailwind_classes: str = Field(default="", description="Recommended Tailwind CSS replacement or addition classes")
    suggested_css: str = Field(default="", description="Standard CSS rule recommendations if Tailwind is not applicable")
    confidence: float = Field(default=0.0, description="Confidence score between 0.0 and 1.0")
    bounding_box: Optional[Dict[str, Any]] = Field(default=None, description="Optional bounding box {x, y, width, height}")

SYSTEM_PROMPT = """You are a senior QA engineer inspecting web page screenshots for VISUAL bugs only (never backend or functional logic issues).
Carefully inspect the provided viewport screenshot alongside the trimmed DOM HTML.

Audit checklist:
1. Clipped or cut-off elements, text, or buttons (especially submit/action buttons pushed offscreen).
2. Overlapping text, buttons, or misplaced layers (e.g. absolute positioning bugs, opacity-0 hiding critical elements).
3. Broken responsive layout, horizontal overflow, or collapsed containers.
4. Misaligned spacing, padding, margins, or broken grid/flex layouts.
5. Illegible contrast or invisible interactive components.

If there are NO visual issues, set has_issue to false and confidence to 1.0.
If there IS a visual issue, identify the exact affected element selector from the DOM, explain the visual discrepancy clearly, and suggest precise Tailwind CSS classes to fix the issue.

You must respond ONLY with valid JSON matching this schema:
{
  "has_issue": bool,
  "issue_type": string,
  "description": string,
  "affected_selector": string,
  "suggested_tailwind_classes": string,
  "suggested_css": string,
  "confidence": float
}
"""

def extract_json_from_text(text: str) -> dict:
    """Extracts JSON from model output, stripping any markdown code fences if present."""
    text = text.strip()
    # Remove markdown code fences if present
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if match:
        text = match.group(1).strip()
    return json.loads(text)

async def analyze_screenshot(image_path: str, dom_html: str, max_retries: int = 3) -> dict:
    """
    Calls Google Gemini API (model 'gemini-2.5-flash') to inspect screenshot for visual bugs.
    
    Args:
        image_path: Path to screenshot image file (.png)
        dom_html: Trimmed DOM HTML string of the audited page
        max_retries: Maximum rate-limit retry attempts

    Returns:
        Structured dict matching VLMResponse schema
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[VLM Engine] Warning: GEMINI_API_KEY not found in environment. Using mock/baseline analyzer.")
        # Fallback offline analyzer for local development without active API key
        return VLMResponse(
            has_issue=False,
            issue_type="",
            description="Offline mode: GEMINI_API_KEY not configured",
            confidence=1.0
        ).model_dump()

    # Load and validate image with PIL
    img_file = Path(image_path)
    if not img_file.exists():
        raise FileNotFoundError(f"Screenshot not found at path: {image_path}")

    pil_img = Image.open(str(img_file))

    # Initialize Google GenAI client
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    prompt_content = f"{SYSTEM_PROMPT}\n\n--- TRIMMED DOM HTML CONTEXT ---\n{dom_html[:15000]}\n"

    last_error = None
    for attempt in range(1, max_retries + 1):
        try:
            # Generate content using Google GenAI SDK (in thread pool to remain non-blocking async)
            response = await asyncio.to_thread(
                client.models.generate_content,
                model=model_name,
                contents=[pil_img, prompt_content],
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    response_mime_type="application/json",
                )
            )

            raw_text = response.text or "{}"
            try:
                parsed_json = extract_json_from_text(raw_text)
            except Exception:
                # Retry once asking strictly for valid JSON without fences
                retry_response = await asyncio.to_thread(
                    client.models.generate_content,
                    model=model_name,
                    contents=[pil_img, prompt_content + "\n\nCRITICAL: Return ONLY valid JSON, no markdown fences, no explanation."],
                )
                parsed_json = extract_json_from_text(retry_response.text or "{}")

            vlm_response = VLMResponse(**parsed_json)
            return vlm_response.model_dump()

        except Exception as err:
            last_error = err
            error_str = str(err).lower()
            is_rate_limit = "429" in error_str or "quota" in error_str or "rate limit" in error_str
            
            if is_rate_limit and attempt < max_retries:
                backoff_seconds = 2 ** attempt
                print(f"[VLM Engine] Rate limit encountered on attempt {attempt}. Retrying in {backoff_seconds}s...")
                await asyncio.sleep(backoff_seconds)
            elif "model" in error_str and ("not found" in error_str or "supported" in error_str) and model_name == "gemini-2.5-flash":
                # Fallback to gemini-1.5-flash if 2.5-flash is not available in region/tier
                print("[VLM Engine] Falling back to model 'gemini-1.5-flash'...")
                model_name = "gemini-1.5-flash"
            else:
                if attempt == max_retries:
                    break
                await asyncio.sleep(1)

    print(f"[VLM Engine] Vision analysis call failed after {max_retries} attempts: {last_error}")
    # Return structured fallback response rather than crashing the pipeline
    return VLMResponse(
        has_issue=False,
        issue_type="api_error",
        description=f"Gemini API analysis failed: {last_error}",
        confidence=0.0
    ).model_dump()
