from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


SentimentLabel = Literal["POSITIVE", "NEGATIVE", "NEUTRAL"]


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    session_id: str = Field(min_length=1, max_length=128)


class SentimentOut(BaseModel):
    label: SentimentLabel
    score: float = Field(ge=0.0, le=1.0)


class ChatResponse(BaseModel):
    response: str
    category: str
    sentiment: SentimentOut
    session_id: str
    timestamp: datetime
    generation_mode: Literal["llm", "fallback"]
    warning: str | None = None


class AnalyticsResponse(BaseModel):
    total_queries: int
    sentiment_distribution: dict[SentimentLabel, int]
    category_distribution: dict[str, int]
    recent_queries: list[dict]
