"""Structured Observability Subsystem for RGPV-Agent LLM Copilot.
Logs every model invocation with latency, token usage, cost estimation,
schema validation status, verifier status, and safety metrics.
"""

import json
import os
import threading
import time
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from pydantic import BaseModel


LOGS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "logs"))
OBSERVABILITY_FILE = os.path.join(LOGS_DIR, "model_observability.jsonl")


# Gemini pricing model (Flash-lite: $0.075/1M input, $0.30/1M output)
INPUT_TOKEN_PRICE_PER_M = 0.075
OUTPUT_TOKEN_PRICE_PER_M = 0.300


@dataclass
class ModelCallRecord:
    run_id: str
    phase: str
    model: str
    latency_ms: int
    input_tokens: int
    output_tokens: int
    schema_valid: bool
    verifier_status: str  # "passed", "clamped", "rejected", "bypassed"
    cost_usd: float
    safety_blocked: bool
    timestamp: float = 0.0
    error: Optional[str] = None

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = time.time()


class ObservabilityTracker:
    _lock = threading.Lock()
    _records: List[Dict[str, Any]] = []
    _total_retries: int = 0
    _total_user_corrections: int = 0
    _total_injection_attempts: int = 0

    @classmethod
    def calculate_cost(cls, input_tokens: int, output_tokens: int, model: str = "gemini-3.5-flash-lite") -> float:
        """Calculates token-based cost in USD according to official Google Gemini API pricing."""
        cost = (input_tokens * INPUT_TOKEN_PRICE_PER_M / 1_000_000.0) + (output_tokens * OUTPUT_TOKEN_PRICE_PER_M / 1_000_000.0)
        return round(cost, 6)

    @classmethod
    def estimate_tokens(cls, text: str) -> int:
        """Heuristic token estimation (~4 characters per token)."""
        if not text:
            return 0
        return max(1, len(text) // 4)

    @classmethod
    def log_call(cls, record: ModelCallRecord) -> Dict[str, Any]:
        """Logs a single model call into in-memory buffer and appends to observability log file."""
        data = asdict(record)
        os.makedirs(LOGS_DIR, exist_ok=True)

        with cls._lock:
            cls._records.append(data)
            if len(cls._records) > 1000:
                cls._records.pop(0)

            # Append to persistent JSONL file
            try:
                with open(OBSERVABILITY_FILE, "a", encoding="utf-8") as f:
                    f.write(json.dumps(data) + "\n")
            except Exception:
                pass

        return data

    @classmethod
    def record_retry(cls) -> int:
        with cls._lock:
            cls._total_retries += 1
            return cls._total_retries

    @classmethod
    def record_user_correction(cls) -> int:
        with cls._lock:
            cls._total_user_corrections += 1
            return cls._total_user_corrections

    @classmethod
    def record_injection_attempt(cls) -> int:
        with cls._lock:
            cls._total_injection_attempts += 1
            return cls._total_injection_attempts

    @classmethod
    def get_metrics(cls) -> Dict[str, Any]:
        """Calculates aggregate observability metrics across recorded model calls."""
        with cls._lock:
            records = list(cls._records)
            retries = cls._total_retries
            user_corrections = cls._total_user_corrections
            injections = cls._total_injection_attempts

        total_calls = len(records)
        if total_calls == 0:
            return {
                "total_calls": 0,
                "average_latency_ms": 0,
                "p95_latency_ms": 0,
                "total_cost_usd": 0.0,
                "average_cost_usd": 0.0,
                "schema_failures": 0,
                "schema_failure_rate_pct": 0.0,
                "retry_count": retries,
                "retry_rate_pct": 0.0,
                "verifier_rejections": 0,
                "low_confidence_grading_count": 0,
                "user_corrections": user_corrections,
                "prompt_injection_attempts": injections
            }

        latencies = [r["latency_ms"] for r in records]
        latencies.sort()
        avg_latency = round(sum(latencies) / total_calls, 1)
        p95_idx = int(total_calls * 0.95)
        p95_latency = latencies[min(p95_idx, total_calls - 1)]

        total_cost = round(sum(r.get("cost_usd", 0.0) for r in records), 6)
        avg_cost = round(total_cost / total_calls, 6)

        schema_failures = sum(1 for r in records if not r.get("schema_valid", True))
        schema_failure_rate = round((schema_failures / total_calls) * 100, 2)
        retry_rate = round((retries / max(1, total_calls + retries)) * 100, 2)

        verifier_rejections = sum(1 for r in records if r.get("verifier_status") in ["rejected", "clamped"])

        return {
            "total_calls": total_calls,
            "average_latency_ms": avg_latency,
            "p95_latency_ms": p95_latency,
            "total_cost_usd": total_cost,
            "average_cost_usd": avg_cost,
            "schema_failures": schema_failures,
            "schema_failure_rate_pct": schema_failure_rate,
            "retry_count": retries,
            "retry_rate_pct": retry_rate,
            "verifier_rejections": verifier_rejections,
            "user_corrections": user_corrections,
            "prompt_injection_attempts": injections
        }

    @classmethod
    def get_recent_logs(cls, limit: int = 50) -> List[Dict[str, Any]]:
        with cls._lock:
            return list(reversed(cls._records[-limit:]))
