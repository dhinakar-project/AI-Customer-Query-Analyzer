from __future__ import annotations

from functools import lru_cache
from typing import TypedDict, Literal

from transformers import pipeline


class SentimentResult(TypedDict):
    label: Literal["POSITIVE", "NEGATIVE", "NEUTRAL"]
    score: float


MODEL_NAME = "distilbert-base-uncased-finetuned-sst-2-english"
NEUTRAL_THRESHOLD = 0.65


@lru_cache(maxsize=1)
def _get_pipeline():
    # Downloads once on first run. Keep in a cached singleton.
    return pipeline("sentiment-analysis", model=MODEL_NAME)


def analyze_sentiment(text: str) -> SentimentResult:
    nlp = _get_pipeline()
    out = nlp(text[:512])[0]  # model max seq length-ish; keep it safe
    label = out["label"].upper()
    score = float(out["score"])

    # Map to NEUTRAL if the model isn't confident.
    if score < NEUTRAL_THRESHOLD:
        return {"label": "NEUTRAL", "score": score}

    if label not in ("POSITIVE", "NEGATIVE"):
        return {"label": "NEUTRAL", "score": score}

    return {"label": label, "score": score}
