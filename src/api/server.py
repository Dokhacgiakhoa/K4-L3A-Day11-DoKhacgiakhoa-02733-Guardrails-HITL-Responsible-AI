"""
Demo backend (FastAPI) cho giao diện web.

Chạy từ gốc repo:

    python src/api/server.py                 # http://127.0.0.1:8000
    python src/api/server.py --port 9000

Nếu có thư mục ``web/`` ở gốc repo (chứa index.html) thì server phục vụ luôn tại ``/``;
API nằm dưới ``/api``. Hợp đồng chi tiết: docs/API.md.

Ba chế độ chat (``mode``):
  blue         Blue có đủ guardrails (pipeline CP2–CP3) — luôn là chế độ mặc định
  red          Red mềm, KHÔNG guardrails (dùng để demo leak)
  red_advance  Red Advance, có guardrails mạnh (bonus B2)
"""
from __future__ import annotations

import sys
import time
from pathlib import Path

_SRC = Path(__file__).resolve().parents[1]
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

import json  # noqa: E402

from fastapi import FastAPI, HTTPException, Query  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402
from pydantic import BaseModel, Field  # noqa: E402

from core import config  # noqa: E402

REPO_ROOT = _SRC.parent
OUTPUTS = REPO_ROOT / "outputs"
WEB_DIR = REPO_ROOT / "web"
MODES = ("blue", "red", "red_advance")
EGRESS_DEMO_DESTINATION = "https://cases.vinbank.example/v1/cases"

app = FastAPI(title="Lab 11 — Guardrails demo backend", version="1.0")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

# ---------------------------------------------------------------------------
# State (một tiến trình = một phiên demo)
# ---------------------------------------------------------------------------
_state: dict = {"pipeline": None, "red": {}, "started": time.time()}


def _pipeline():
    if _state["pipeline"] is None:
        from assignment.pipeline import (
            BluePipeline, build_observability, build_production_plugins,
        )

        audit, monitor = build_observability()
        _state["pipeline"] = BluePipeline(build_production_plugins(), audit, monitor)
    return _state["pipeline"]


def _red_agent(mode: str):
    if mode not in _state["red"]:
        if mode == "red":
            from agents.agent import create_red_agent_default as factory
        else:
            from agents.guards_agent import create_red_agent_advance as factory
        _state["red"][mode] = factory()
    return _state["red"][mode]


def _load_json(name: str):
    path = OUTPUTS / name
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str = Field(..., description="Nội dung người dùng gửi")
    user_id: str = Field("web-user", description="Khoá rate limit (mỗi user một cửa sổ)")
    mode: str = Field("blue", description="blue | red | red_advance")


class AttackRequest(BaseModel):
    target: str = Field("red", description="blue | red | red_advance")
    prompt_id: int | None = Field(None, description="id trong /api/attack-prompts")
    prompt: str | None = Field(None, description="Prompt tuỳ ý (ưu tiên hơn prompt_id)")
    user_id: str = "attacker"


# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------
async def _run(mode: str, message: str, user_id: str) -> dict:
    """Chạy một tin nhắn qua ``mode`` và trả dict thống nhất."""
    from attacks.attacks import response_leaked_secrets

    if mode not in MODES:
        raise HTTPException(400, f"mode phải là một trong {MODES}")
    started = time.perf_counter()

    if mode == "blue":
        res = await _pipeline().handle(message, user_id=user_id)
        out = {
            "mode": mode, "blocked": res["blocked"], "layer": res["layer"],
            "response": res["response"], "error": res["error"],
            "request_id": res["request_id"], "trace": res["trace"],
        }
    else:
        from core.utils import chat_with_agent

        agent, runner = _red_agent(mode)
        label = "Red" if mode == "red" else "Red Advance"
        not_here = f"{label} không đi qua pipeline của Blue"
        trace = [
            {"step": "rate_limit", "status": "skipped", "detail": not_here, "ms": 0.0},
            {"step": "input_guardrail", "status": "skipped", "detail": not_here, "ms": 0.0},
        ]
        t0 = time.perf_counter()
        try:
            text, _ = await chat_with_agent(agent, runner, message)
            text = (text or "").strip()
            trace.append({"step": "llm", "status": "passed",
                          "detail": f"{label} ({config.red_provider_label()}) trả lời "
                                    f"({len(text)} ký tự)",
                          "ms": round((time.perf_counter() - t0) * 1000, 1)})
            out = {"mode": mode, "blocked": False, "layer": None,
                   "response": text, "error": None, "request_id": None}
        except Exception as exc:  # noqa: BLE001
            err = f"{type(exc).__name__}: {exc}"
            trace.append({"step": "llm", "status": "error", "detail": err[:200],
                          "ms": round((time.perf_counter() - t0) * 1000, 1)})
            out = {"mode": mode, "blocked": False, "layer": "error",
                   "response": f"[LLM unavailable] {err}", "error": err, "request_id": None}
        trace.append({"step": "output_guardrail", "status": "skipped",
                      "detail": f"{label} không có output guardrail của Blue", "ms": 0.0})
        out["trace"] = trace

    out["input"] = message
    out["leaked"] = response_leaked_secrets(out["response"])
    out["trace"].append(_egress_step(out))
    out["latency_ms"] = round((time.perf_counter() - started) * 1000, 1)
    return out


def _egress_step(out: dict) -> dict:
    """Bước 5 (minh hoạ): nếu gửi câu trả lời này sang hệ thống case nội bộ thì egress có cho không?"""
    from assignment.pipeline import is_egress_allowed

    if out.get("error"):
        return {"step": "egress", "status": "skipped",
                "detail": "LLM lỗi — không có dữ liệu để gửi đi", "ms": 0.0}
    t0 = time.perf_counter()
    allowed = is_egress_allowed(EGRESS_DEMO_DESTINATION, out["response"])
    return {
        "step": "egress",
        "status": "passed" if allowed else "blocked",
        "detail": (f"Cho phép gửi tới {EGRESS_DEMO_DESTINATION}" if allowed
                   else "Chặn: payload chứa secret / PII — không được gửi ra ngoài"),
        "ms": round((time.perf_counter() - t0) * 1000, 2),
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "uptime_s": round(time.time() - _state["started"], 1),
        "blue_model": config.blue_provider_label(),
        "red_model": config.red_provider_label(),
        "keys_present": {
            "openrouter": bool(config.get_openrouter_api_key()),
            "red": bool(
                __import__("os").environ.get(
                    "GOOGLE_API_KEY" if config.red_uses_gemini() else "OPENAI_API_KEY", ""
                ).strip()
            ),
        },
        "modes": list(MODES),
    }


@app.post("/api/chat")
async def chat(req: ChatRequest):
    return await _run(req.mode, req.message, req.user_id)


@app.get("/api/attack-prompts")
def attack_prompts():
    from attacks.attacks import adversarial_prompts

    return [{"id": a["id"], "category": a["category"], "input": a["input"]}
            for a in adversarial_prompts]


@app.post("/api/attack")
async def attack(req: AttackRequest):
    """Chạy một prompt tấn công (tuỳ ý hoặc theo id) lên target."""
    from attacks.attacks import adversarial_prompts

    prompt = req.prompt
    if prompt is None:
        match = next((a for a in adversarial_prompts if a["id"] == req.prompt_id), None)
        if match is None:
            raise HTTPException(400, "Cần `prompt` hoặc `prompt_id` hợp lệ")
        prompt = match["input"]
    return await _run(req.target, prompt, req.user_id)


@app.get("/api/attack-suite")
async def attack_suite(target: str = Query("red", description="blue | red | red_advance")):
    """Chạy cả 5 prompt CP4 lên target (tuần tự; tốn 5 lượt gọi LLM)."""
    from attacks.attacks import adversarial_prompts

    rows = []
    for a in adversarial_prompts:
        r = await _run(target, a["input"], f"suite-{a['id']}")
        r.update(id=a["id"], category=a["category"])
        rows.append(r)
    return {"target": target, "total": len(rows),
            "leaked": sum(r["leaked"] for r in rows),
            "blocked": sum(r["blocked"] for r in rows), "results": rows}


@app.get("/api/metrics")
def metrics():
    return _pipeline().snapshot()


@app.get("/api/audit")
def audit(limit: int = Query(50, ge=1, le=500)):
    logs = _pipeline().audit.logs
    return {"total": len(logs), "logs": logs[-limit:][::-1]}  # mới nhất trước


@app.post("/api/reset")
def reset():
    """Xoá rate-limit window, audit log và metrics (bắt đầu phiên demo mới)."""
    _state["pipeline"] = None
    return {"status": "reset"}


@app.get("/api/egress-check")
def egress_check(destination: str, payload: str = ""):
    from assignment.pipeline import is_egress_allowed

    return {"destination": destination, "allowed": is_egress_allowed(destination, payload)}


@app.get("/api/results")
def results():
    data = _load_json("results.json")
    if data is None:
        raise HTTPException(404, "outputs/results.json chưa có — chạy: python src/main.py --part 3")
    return data


@app.get("/api/attack-results")
def attack_results():
    data = _load_json("attack_results.json")
    if data is None:
        raise HTTPException(404, "outputs/attack_results.json chưa có — chạy: python src/main.py --part 4")
    return data


@app.get("/api/grade-report")
def grade_report():
    data = _load_json("grade_report.json")
    if data is None:
        raise HTTPException(404, "outputs/grade_report.json chưa có — chạy scripts/grade.py")
    return data


if WEB_DIR.is_dir() and (WEB_DIR / "index.html").exists():
    app.mount("/", StaticFiles(directory=str(WEB_DIR), html=True), name="web")


if __name__ == "__main__":
    import argparse

    import uvicorn

    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=8000)
    args = ap.parse_args()
    uvicorn.run(app, host=args.host, port=args.port, log_level="info")
