from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import QueryLog
from schemas import AnalyticsResponse


router = APIRouter(prefix="/api", tags=["analytics"])


@router.get("/analytics", response_model=AnalyticsResponse)
async def analytics(db: Session = Depends(get_db)):
    total = db.scalar(select(func.count(QueryLog.id))) or 0

    sent_rows = db.execute(
        select(QueryLog.sentiment_label, func.count(QueryLog.id)).group_by(QueryLog.sentiment_label)
    ).all()
    sentiment_distribution = {"POSITIVE": 0, "NEGATIVE": 0, "NEUTRAL": 0}
    for label, count in sent_rows:
        if label in sentiment_distribution:
            sentiment_distribution[label] = int(count)

    cat_rows = db.execute(select(QueryLog.category, func.count(QueryLog.id)).group_by(QueryLog.category)).all()
    category_distribution: dict[str, int] = {str(cat): int(count) for cat, count in cat_rows}

    recent = (
        db.execute(select(QueryLog).order_by(QueryLog.created_at.desc()).limit(10))
        .scalars()
        .all()
    )
    recent_queries = [
        {
            "id": r.id,
            "session_id": r.session_id,
            "user_message": r.user_message,
            "category": r.category,
            "sentiment": {"label": r.sentiment_label, "score": float(r.sentiment_score)},
            "bot_response": r.bot_response,
            "timestamp": r.created_at.isoformat(),
        }
        for r in recent
    ]

    return AnalyticsResponse(
        total_queries=int(total),
        sentiment_distribution=sentiment_distribution,  # type: ignore[arg-type]
        category_distribution=category_distribution,
        recent_queries=recent_queries,
    )
