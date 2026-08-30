import os
import json
import re
import asyncio
from typing import Dict, List, Optional
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are a senior software engineer and technical writer.
You will be provided with structured findings from a multimodal visual regression audit.
Generate:
1. A concise, professional 2-3 sentence Pull Request description explaining what visual issue was observed and how the fix resolves it.
2. A single-line conventional commit message (e.g., 'fix(ui): fix hidden submit button on mobile viewport').

Respond ONLY with valid JSON in this format:
{
  "pr_description": "2-3 sentences explaining the visual defect and resolution.",
  "commit_message": "fix(ui): concise commit message"
}
"""

def extract_json_from_text(text: str) -> dict:
    """Extracts JSON object from LLM response text, stripping markdown blocks if present."""
    text = text.strip()
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if match:
        text = match.group(1).strip()
    try:
        return json.loads(text)
    except Exception:
        # Fallback regex extraction if JSON decoding fails
        pr_match = re.search(r'"pr_description":\s*"([^"]+)"', text)
        commit_match = re.search(r'"commit_message":\s*"([^"]+)"', text)
        return {
            "pr_description": pr_match.group(1) if pr_match else text,
            "commit_message": commit_match.group(1) if commit_match else "fix(ui): resolve visual regression issue"
        }

async def summarize_for_pr(vlm_response: dict, issue_history: Optional[List[dict]] = None) -> dict:
    """
    Calls Groq API (model 'llama-3.1-8b-instant') to generate a PR description and commit message.
    
    Args:
        vlm_response: dict containing 'issue_type', 'description', 'suggested_tailwind_classes', 'affected_selector'
        issue_history: optional list of previous fix attempts
        
    Returns:
        dict: {"pr_description": str, "commit_message": str}
    """
    issue_type = vlm_response.get("issue_type", "visual defect")
    description = vlm_response.get("description", "visual misalignment")
    suggested_classes = vlm_response.get("suggested_tailwind_classes", "")
    suggested_css = vlm_response.get("suggested_css", "")
    selector = vlm_response.get("affected_selector", "")

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("[Groq Helper] Notice: GROQ_API_KEY not set. Using professional template fallback generator.")
        fix_detail = suggested_classes if suggested_classes else (suggested_css or "responsive styling")
        return {
            "pr_description": (
                f"This automated pull request addresses a visual regression identified during multi-viewport QA testing. "
                f"The issue involved {description} on element `{selector or 'component'}`. "
                f"The fix updates CSS/Tailwind classes ({fix_detail}) to restore proper visibility and alignment across all screen sizes."
            ),
            "commit_message": f"fix(ui): resolve {issue_type} on {selector or 'responsive layout'}"
        }

    client = AsyncGroq(api_key=api_key)
    model_name = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

    user_prompt = f"""
Visual Issue Type: {issue_type}
Element / Selector: {selector}
Issue Description: {description}
Suggested Tailwind Classes: {suggested_classes}
Suggested CSS: {suggested_css}
Previous Attempts Count: {len(issue_history) if issue_history else 0}

Please generate the structured JSON containing 'pr_description' and 'commit_message'.
"""

    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            model=model_name,
            temperature=0.2,
            response_format={"type": "json_object"}
        )

        content = chat_completion.choices[0].message.content
        parsed = extract_json_from_text(content)

        return {
            "pr_description": parsed.get("pr_description", "").strip(),
            "commit_message": parsed.get("commit_message", f"fix(ui): resolve {issue_type}").strip()
        }

    except Exception as e:
        print(f"[Groq Helper] Warning: Groq API call failed: {e}. Using deterministic fallback.")
        return {
            "pr_description": f"Automated visual regression fix for {issue_type}: {description}. Applied suggested styling: {suggested_classes}.",
            "commit_message": f"fix(ui): resolve {issue_type}"
        }
