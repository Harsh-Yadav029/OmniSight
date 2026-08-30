import re
from typing import Union, Dict, Any
from pydantic import BaseModel, Field
from vlm_engine.analyze import VLMResponse

class CodeFix(BaseModel):
    selector: str = Field(..., description="Target DOM or JSX selector (e.g. #submit-order-button)")
    tailwind_classes: str = Field(default="", description="Normalized Tailwind CSS classes to apply")
    css: str = Field(default="", description="Standard CSS rule fallback if Tailwind is not applicable")
    file_hint: str = Field(default="", description="Inferred source file path within test-target-app (e.g. src/components/SubmitButton.jsx)")

def infer_source_file(selector: str, issue_description: str, issue_type: str) -> str:
    """Infers the target source file path inside test-target-app based on selectors and issue context."""
    text_to_check = f"{selector} {issue_description} {issue_type}".lower()

    if any(k in text_to_check for k in ["submit", "place order", "submit-order", "submitbutton", "order-button"]):
        return "src/components/SubmitButton.jsx"
    elif any(k in text_to_check for k in ["productcard", "product-card", "product-grid", "add-to-cart"]):
        return "src/components/ProductCard.jsx"
    elif any(k in text_to_check for k in ["navbar", "nav-cart", "logo", "header"]):
        return "src/components/Navbar.jsx"
    elif any(k in text_to_check for k in ["cartsummary", "proceed-to-checkout", "order-summary", "cart-summary"]):
        return "src/components/CartSummary.jsx"
    elif any(k in text_to_check for k in ["cartitem", "cart-item", "qty-plus", "qty-minus"]):
        return "src/components/CartItem.jsx"
    elif any(k in text_to_check for k in ["checkoutform", "fullname", "email", "address", "shipping"]):
        return "src/components/CheckoutForm.jsx"
    elif any(k in text_to_check for k in ["checkout"]):
        return "src/pages/Checkout.jsx"
    elif any(k in text_to_check for k in ["cart"]):
        return "src/pages/Cart.jsx"
    
    # Default fallback to primary bug injection component if button/action related
    return "src/components/SubmitButton.jsx"

def normalize_class_string(classes: str) -> str:
    """Cleans up and normalizes class strings by removing extra spaces, quotes, and punctuation."""
    if not classes:
        return ""
    # Remove quotes, backticks, leading/trailing curly braces
    cleaned = re.sub(r'["\'`{}]', '', classes)
    # Collapse multiple whitespace characters into single space
    cleaned = " ".join(cleaned.split())
    return cleaned.strip()

def extract_fix(vlm_response: Union[VLMResponse, Dict[str, Any]]) -> CodeFix:
    """
    Normalizes and validates the VLM's structured output into a CodeFix object.
    Prioritizes suggested_tailwind_classes over raw CSS.
    Raises ValueError if has_issue=True but target selector and fix classes are empty.

    Args:
        vlm_response: VLMResponse instance or dictionary

    Returns:
        CodeFix object
    """
    if isinstance(vlm_response, dict):
        vlm = VLMResponse(**vlm_response)
    else:
        vlm = vlm_response

    selector = (vlm.affected_selector or "").strip()
    tailwind_classes = normalize_class_string(vlm.suggested_tailwind_classes or "")
    css_code = (vlm.suggested_css or "").strip()
    description = vlm.description or ""
    issue_type = vlm.issue_type or ""

    if vlm.has_issue:
        # Strict validation: never allow applying a blind fix with no target selector or styling
        if not selector and not tailwind_classes and not css_code:
            raise ValueError(
                "Invalid VLMResponse: has_issue is True, but affected_selector, suggested_tailwind_classes, and suggested_css are all empty. Cannot apply a blind fix."
            )

        # Fallback selector inference if element is strongly implied in description
        if not selector:
            if "submit" in description.lower() or "button" in description.lower():
                selector = "#submit-order-button"
            else:
                raise ValueError("Invalid VLMResponse: has_issue is True but no target selector was identified.")

    file_hint = infer_source_file(selector, description, issue_type)

    return CodeFix(
        selector=selector,
        tailwind_classes=tailwind_classes,
        css=css_code,
        file_hint=file_hint
    )
