import os
import json
import re
from typing import Dict, Any, List
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

def extract_json_from_markdown(text: str) -> Dict[str, Any]:
    """Extracts JSON object from text that might contain markdown fences or surrounding narrative."""
    clean_text = text.strip()
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", clean_text, re.DOTALL)
    if match:
        clean_text = match.group(1)
    else:
        obj_match = re.search(r"(\{.*\})", clean_text, re.DOTALL)
        if obj_match:
            clean_text = obj_match.group(1)

    return json.loads(clean_text)

# Export alias for backward test compatibility
extract_json_from_text = extract_json_from_markdown

async def summarize_for_pr(vlm_result: Dict[str, Any], fix_history: List[Dict[str, Any]]) -> Dict[str, str]:
    """
    Summarizes the visual defect analysis and fix iterations using Groq.

    Args:
        vlm_result: Final VLM structured inspection result
        fix_history: Chronological list of fix attempts

    Returns:
        dict: {"commit_message": str, "pr_description": str}
    """
    api_key = os.getenv("GROQ_API_KEY")

    issue_type = vlm_result.get("issue_type", "visual defect")
    description = vlm_result.get("description", "Visual regression fixed.")
    selector = vlm_result.get("affected_selector", "")
    suggested_classes = vlm_result.get("suggested_tailwind_classes", "")

    # Fallback template if GROQ_API_KEY is not configured
    if not api_key or api_key.strip() in ["", "your_groq_api_key", "your_api_key_here"]:
        print("[Groq Helper] Notice: GROQ_API_KEY not set. Using professional template fallback generator.")
        selector_part = f" on {selector}" if selector else ""
        return {
            "commit_message": f"fix(ui): resolve {issue_type}{selector_part}",
            "pr_description": f"This automated pull request addresses a visual regression identified during multi-viewport QA testing.\n\n"
                              f"**Defect Identified:** {description}\n"
                              f"**Applied Fix:** Updated styling with Tailwind CSS: `{suggested_classes}`."
        }

    prompt = f"""You are an automated QA engineering agent summarizing an autonomous visual regression fix for a GitHub Pull Request.

Defect Details:
- Issue Type: {issue_type}
- Description: {description}
- Affected CSS Selector: {selector}
- Suggested Fix Classes: {suggested_classes}
- Total Fix Attempts: {len(fix_history)}

Generate a JSON object with:
1. "commit_message": A conventional commit message (e.g. "fix(ui): resolve hidden button on mobile checkout")
2. "pr_description": A 2-3 sentence technical description of what was broken, which viewport/element was affected, and how the fix resolved it.

Return ONLY a valid JSON object matching this schema:
{{
  "commit_message": "string",
  "pr_description": "string"
}}
"""

    models_to_try = [
        "llama-3.3-70b-versatile",
        "llama3-8b-8192",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768"
    ]

    client = AsyncGroq(api_key=api_key)

    for model in models_to_try:
        try:
            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a senior frontend QA automation engineer. Respond strictly in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=300,
                response_format={"type": "json_object"}
            )
            raw_content = response.choices[0].message.content or "{}"
            parsed = extract_json_from_markdown(raw_content)
            if "commit_message" in parsed and "pr_description" in parsed:
                return parsed
        except Exception as e:
            continue

    # Deterministic fallback if API calls exhausted
    selector_part = f" on {selector}" if selector else ""
    return {
        "commit_message": f"fix(ui): resolve {issue_type}{selector_part}",
        "pr_description": f"Automated visual regression fix for {issue_type}: {description}. Applied verified Tailwind CSS styles: `{suggested_classes}`."
    }
