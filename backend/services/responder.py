from __future__ import annotations

import os
from typing import Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from services.memory import get_session_memory


SYSTEM_TEMPLATE = """
You are a helpful, empathetic customer support agent for a retail/tech company.

Guidelines:
- If sentiment is NEGATIVE, start with empathy and apologize
- If sentiment is POSITIVE, match their energy
- Be concise (2-4 sentences max)
- Always offer a next step or resolution
- Do not make up order numbers or policies

Conversation so far:
{history}

Human: {input}
Assistant:
""".strip()


def _get_llm() -> Optional[ChatGoogleGenerativeAI]:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None
    # `gemini-1.5-flash` is not available in the current model list for this API environment.
    return ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0.4)


class _RagLite:
    def __init__(self) -> None:
        self._emb = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        self._vs: Optional[FAISS] = None

    def add(self, text: str, metadata: dict) -> None:
        if self._vs is None:
            self._vs = FAISS.from_texts([text], embedding=self._emb, metadatas=[metadata])
        else:
            self._vs.add_texts([text], metadatas=[metadata])

    def retrieve(self, query: str, k: int = 3) -> str:
        if self._vs is None:
            return ""
        docs = self._vs.similarity_search(query, k=k)
        lines: list[str] = []
        for d in docs:
            meta = d.metadata or {}
            cat = meta.get("category", "Unknown")
            sent = meta.get("sentiment", "Unknown")
            lines.append(f"- ({cat}, {sent}) {d.page_content}")
        return "\n".join(lines)


_rag = _RagLite()


def _extract_text(content) -> str:
    """
    Gemini may return structured `content` (e.g. list of text parts).
    Normalize it to plain text for downstream parsing.
    """
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


def _pick_prompt(message: str, prompts: list[str]) -> str:
    seed = sum(ord(ch) for ch in message.strip().lower())
    return prompts[seed % len(prompts)]


def _fallback_response(category: str, sentiment: str, message: str) -> str:
    if sentiment == "NEGATIVE":
        opener = _pick_prompt(
            message,
            [
                "I’m sorry you’re dealing with this, and I appreciate you flagging it.",
                "I’m sorry this has been frustrating, and thanks for letting us know.",
                "I can see why this would be frustrating, and I’m here to help.",
            ],
        )
    elif sentiment == "POSITIVE":
        opener = _pick_prompt(
            message,
            [
                "Happy to help with that.",
                "Absolutely, I can help with that.",
                "Thanks for reaching out. I’d be glad to help.",
            ],
        )
    else:
        opener = _pick_prompt(
            message,
            [
                "Thanks for reaching out.",
                "Happy to help with this.",
                "Thanks for the details so far.",
            ],
        )

    next_step = "Could you share any relevant details (order ID, error message, or date of purchase) so I can guide you to the right next step?"
    if category == "Returns & Refunds":
        next_step = "If you tell me when you purchased it and whether it’s opened/used, I can outline the best return/refund path."
    elif category == "Billing & Payments":
        next_step = "Please share the charge date/amount and whether it shows as pending or posted, and I’ll help you resolve it."
    elif category == "Technical Support":
        next_step = "What device/app version are you using, and what exact error (or steps) lead to the issue?"
    elif category == "Shipping & Delivery":
        next_step = "If you share your order date and tracking status (or last update), I can suggest the best next step."
    elif category == "Account Issues":
        next_step = "Tell me what happens when you try to sign in (any error text), and whether you can access your email/phone for verification."
    elif category == "Product Information":
        next_step = "If you share the product name or link and what you want to confirm, I can help with the key details."
    elif category == "Complaints":
        next_step = "Please share what happened and when, and I’ll help you frame the fastest path to a resolution."

    if len(message.split()) <= 3 and category == "General Inquiry":
        next_step = _pick_prompt(
            message,
            [
                "Can you share a bit more about what you need help with?",
                "What would you like help with today? A little more detail will help me guide you.",
                "Could you tell me a little more about the issue or question so I can point you in the right direction?",
            ],
        )

    return f"{opener} {next_step}"


def _fallback_warning(llm_error: Exception | None) -> str:
    base = "Gemini response generation is unavailable, so the app is using a built-in fallback reply."
    if llm_error and "API key not valid" in str(llm_error):
        return f"{base} Check `backend/.env` and replace `GOOGLE_API_KEY` with a valid key."
    if llm_error and "API_KEY_INVALID" in str(llm_error):
        return f"{base} Check `backend/.env` and replace `GOOGLE_API_KEY` with a valid key."
    if llm_error is None:
        return f"{base} Set `GOOGLE_API_KEY` in `backend/.env` to enable live model responses."
    return base


async def generate_response(
    *,
    session_id: str,
    category: str,
    sentiment_label: str,
    message: str,
) -> dict[str, str | None]:
    llm = _get_llm()
    retrieved_context = _rag.retrieve(message, k=3)
    enriched_input = (
        "[Context]\n"
        f"Category: {category}\n"
        f"Sentiment: {sentiment_label}\n"
        f"Retrieved context: {retrieved_context if retrieved_context else 'None'}\n"
        "[Customer Message]\n"
        f"{message}"
    )

    if llm is None:
        resp = _fallback_response(category, sentiment_label, message)
        _rag.add(message, {"category": category, "sentiment": sentiment_label, "role": "customer"})
        _rag.add(resp, {"category": category, "sentiment": sentiment_label, "role": "agent"})
        return {"response": resp, "generation_mode": "fallback", "warning": _fallback_warning(None)}

    memory = get_session_memory(session_id, k=5)

    llm_error: Exception | None = None
    try:
        history_messages = memory.chat_memory.messages
        messages = [
            SystemMessage(
                content=(
                    "You are a helpful, empathetic customer support agent for a retail/tech company.\n"
                    "If sentiment is NEGATIVE, start with empathy and apologize.\n"
                    "If sentiment is POSITIVE, match their energy.\n"
                    "Be concise (2-4 sentences max). Always offer a next step or resolution.\n"
                    "Do not make up order numbers or policies."
                )
            )
        ] + history_messages + [HumanMessage(content=enriched_input)]

        result = await llm.ainvoke(messages)
        out = _extract_text(getattr(result, "content", None)).strip()
        if not out:
            raise ValueError("Gemini returned an empty response.")

        # Preserve chat history for this session.
        memory.chat_memory.add_user_message(enriched_input)
        memory.chat_memory.add_ai_message(out)

        resp = out
        mode = "llm"
        warning = None
    except Exception as exc:
        llm_error = exc
        resp = _fallback_response(category, sentiment_label, message)
        mode = "fallback"
        warning = _fallback_warning(llm_error)

    _rag.add(message, {"category": category, "sentiment": sentiment_label, "role": "customer"})
    _rag.add(resp, {"category": category, "sentiment": sentiment_label, "role": "agent"})
    return {"response": resp, "generation_mode": mode, "warning": warning}
