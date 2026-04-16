from __future__ import annotations

from dataclasses import dataclass
from threading import Lock

from langchain_classic.memory import ConversationBufferWindowMemory


@dataclass(frozen=True)
class SessionMemory:
    memory: ConversationBufferWindowMemory


_lock = Lock()
_sessions: dict[str, SessionMemory] = {}


def get_session_memory(session_id: str, k: int = 5) -> ConversationBufferWindowMemory:
    with _lock:
        existing = _sessions.get(session_id)
        if existing:
            return existing.memory

        mem = ConversationBufferWindowMemory(k=k, return_messages=True)
        _sessions[session_id] = SessionMemory(memory=mem)
        return mem
