from __future__ import annotations

import os
from typing import Optional

from langchain_google_genai import ChatGoogleGenerativeAI


CLASSIFICATION_PROMPT = """
You are a customer support query classifier.
Classify the following customer query into EXACTLY ONE of these categories:
- Billing & Payments
- Technical Support
- Returns & Refunds
- Shipping & Delivery
- Account Issues
- Product Information
- Complaints
- General Inquiry

Query: {query}

Respond with ONLY the category name, nothing else.
""".strip()

ALLOWED = {
    "Billing & Payments",
    "Technical Support",
    "Returns & Refunds",
    "Shipping & Delivery",
    "Account Issues",
    "Product Information",
    "Complaints",
    "General Inquiry",
}


def _extract_text(content) -> str:
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, dict):
                t = item.get("text") or item.get("content") or ""
                if t:
                    parts.append(str(t))
            else:
                parts.append(str(item))
        return "".join(parts).strip()
    return str(content).strip()


def _heuristic_category(query: str) -> str:
    q = query.lower()
    if any(k in q for k in ["refund", "return", "chargeback", "cancel order"]):
        return "Returns & Refunds"
    if any(k in q for k in ["delivery", "shipping", "shipment", "tracking", "arrive", "late"]):
        return "Shipping & Delivery"
    if any(k in q for k in ["login", "password", "account", "sign in", "locked", "verification"]):
        return "Account Issues"
    if any(k in q for k in ["bill", "billing", "charged", "payment", "invoice", "card", "subscription"]):
        return "Billing & Payments"
    if any(k in q for k in ["broken", "error", "bug", "crash", "not working", "issue", "install", "update"]):
        return "Technical Support"
    if any(k in q for k in ["spec", "features", "does it", "compatible", "warranty", "price"]):
        return "Product Information"
    if any(k in q for k in ["complaint", "unacceptable", "angry", "terrible", "worst", "disappointed"]):
        return "Complaints"
    return "General Inquiry"


def _get_llm() -> Optional[ChatGoogleGenerativeAI]:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None
    # `gemini-1.5-flash` is not present in the current model list for this API environment.
    return ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0.0)


async def classify_query(query: str) -> str:
    llm = _get_llm()
    if llm is None:
        return _heuristic_category(query)

    msg = CLASSIFICATION_PROMPT.format(query=query)
    try:
        res = await llm.ainvoke(msg)
        text = _extract_text(getattr(res, "content", None)).strip()
    except Exception:
        return _heuristic_category(query)

    # Normalize / guardrails.
    if text in ALLOWED:
        return text

    # Sometimes models add punctuation/whitespace.
    cleaned = text.strip().strip('"').strip("'")
    for cat in ALLOWED:
        if cleaned.lower() == cat.lower():
            return cat

    return _heuristic_category(query)
