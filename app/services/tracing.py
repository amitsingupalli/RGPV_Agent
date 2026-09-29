import os
import time
import uuid
from datetime import datetime, timezone
from typing import Optional, Any
from pydantic import BaseModel, Field
from app.config import get_settings

settings = get_settings()


class AgentTraceEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:8]}")
    trace_id: str
    run_id: str
    user_id: str
    node_name: str
    latency_ms: float
    token_usage: int = 0
    tool_calls_count: int = 0
    validation_status: str = "passed"  # passed, warning, failed
    confidence: Optional[float] = None
    error: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class RunTelemetrySummary(BaseModel):
    run_id: str
    total_events: int
    total_latency_ms: float
    total_tokens: int
    failed_nodes_count: int
    avg_confidence: float
    events: list[AgentTraceEvent]


class TraceLogger:
    """Observability and audit logging manager with Langfuse export capability."""

    _events_buffer: list[AgentTraceEvent] = []

    @classmethod
    def record_node_execution(
        cls,
        run_id: str,
        user_id: str,
        node_name: str,
        latency_ms: float,
        token_usage: int = 0,
        tool_calls_count: int = 0,
        validation_status: str = "passed",
        confidence: Optional[float] = None,
        error: Optional[str] = None
    ) -> AgentTraceEvent:
        event = AgentTraceEvent(
            trace_id=f"tr_{run_id[:8]}",
            run_id=run_id,
            user_id=user_id,
            node_name=node_name,
            latency_ms=round(latency_ms, 2),
            token_usage=token_usage,
            tool_calls_count=tool_calls_count,
            validation_status=validation_status,
            confidence=confidence,
            error=error
        )
        cls._events_buffer.append(event)

        # Optional Langfuse export if credentials present
        if settings.LANGFUSE_PUBLIC_KEY and settings.LANGFUSE_SECRET_KEY:
            cls._export_to_langfuse(event)

        return event

    @classmethod
    def get_run_summary(cls, run_id: str) -> RunTelemetrySummary:
        run_events = [e for e in cls._events_buffer if e.run_id == run_id]
        total_lat = sum(e.latency_ms for e in run_events)
        total_tok = sum(e.token_usage for e in run_events)
        failed_count = sum(1 for e in run_events if e.validation_status == "failed" or e.error is not None)
        
        confidences = [e.confidence for e in run_events if e.confidence is not None]
        avg_conf = sum(confidences) / len(confidences) if confidences else 1.0

        return RunTelemetrySummary(
            run_id=run_id,
            total_events=len(run_events),
            total_latency_ms=round(total_lat, 2),
            total_tokens=total_tok,
            failed_nodes_count=failed_count,
            avg_confidence=round(avg_conf, 2),
            events=run_events
        )

    @classmethod
    def clear_buffer(cls) -> None:
        cls._events_buffer.clear()

    @staticmethod
    def _export_to_langfuse(event: AgentTraceEvent) -> None:
        try:
            # Lazy import to avoid hard crash if langfuse not configured
            from langfuse import Langfuse
            lf = Langfuse(
                public_key=settings.LANGFUSE_PUBLIC_KEY,
                secret_key=settings.LANGFUSE_SECRET_KEY,
                host=settings.LANGFUSE_HOST
            )
            lf.trace(
                id=event.trace_id,
                name=f"rgpv_agent_{event.node_name}",
                user_id=event.user_id,
                metadata={
                    "run_id": event.run_id,
                    "node": event.node_name,
                    "validation": event.validation_status,
                    "error": event.error
                }
            )
        except Exception:
            pass


class TimedNodeContext:
    """Context manager to measure and log node execution latency automatically."""

    def __init__(
        self,
        run_id: str,
        user_id: str,
        node_name: str,
        estimated_tokens: int = 0
    ):
        self.run_id = run_id
        self.user_id = user_id
        self.node_name = node_name
        self.estimated_tokens = estimated_tokens
        self.start_time: float = 0.0

    def __enter__(self):
        self.start_time = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        duration_ms = (time.perf_counter() - self.start_time) * 1000.0
        error_msg = str(exc_val) if exc_val else None
        status = "failed" if exc_val else "passed"
        TraceLogger.record_node_execution(
            run_id=self.run_id,
            user_id=self.user_id,
            node_name=self.node_name,
            latency_ms=duration_ms,
            token_usage=self.estimated_tokens,
            validation_status=status,
            error=error_msg
        )
