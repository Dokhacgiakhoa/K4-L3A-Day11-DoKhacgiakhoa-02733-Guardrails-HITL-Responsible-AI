"""
Lab 11 — Helper Utilities
"""
from core.config import get_llm_provider, PROVIDER_OPENROUTER  # noqa: F401
from core.openai_runtime import OpenAIRunner


_TRANSIENT_MARKERS = (
    "429", "503", "502", "504", "unavailable", "resource_exhausted",
    "rate limit", "rate-limit", "overloaded", "timed out", "timeout", "connection",
)
_RETRY_DELAYS = (4, 10, 20)  # giây; tối đa 3 lần thử lại


def _is_transient(exc: Exception) -> bool:
    msg = f"{type(exc).__name__} {exc}".lower()
    # Hết quota theo NGÀY (Gemini "PerDay", OpenRouter "free-models-per-day"): thử lại vô ích
    if any(m in msg for m in ("perday", "per-day", "per day")):
        return False
    return any(m in msg for m in _TRANSIENT_MARKERS)


async def chat_with_agent(agent, runner, user_message: str, session_id=None):
    """Như _chat_once nhưng tự thử lại khi gặp lỗi tạm thời (429/503/timeout)."""
    import asyncio

    for attempt, delay in enumerate((*_RETRY_DELAYS, None)):
        try:
            return await _chat_once(agent, runner, user_message, session_id)
        except Exception as exc:
            if delay is None or not _is_transient(exc):
                raise
            print(f"  [retry {attempt + 1}/{len(_RETRY_DELAYS)}] {type(exc).__name__}; waiting {delay}s")
            await asyncio.sleep(delay)


async def _chat_once(agent, runner, user_message: str, session_id=None):
    """Send a message to the agent and get the response.

    Works with OpenAIRunner (OpenAI Red / OpenRouter Blue) and Google ADK (Gemini Red).
    """
    provider = getattr(runner, "provider", None)
    if isinstance(runner, OpenAIRunner) or provider in ("openrouter", "openai"):
        text = await runner.chat(agent, user_message)
        return text, None

    from google.genai import types

    user_id = "student"
    app_name = runner.app_name

    session = None
    if session_id is not None:
        try:
            session = await runner.session_service.get_session(
                app_name=app_name, user_id=user_id, session_id=session_id
            )
        except (ValueError, KeyError):
            pass

    if session is None:
        try:
            session = await runner.session_service.create_session(
                app_name=app_name, user_id=user_id
            )
        except Exception:
            session = await runner.session_service.create_session(
                app_name=app_name, user_id=user_id
            )

    content = types.Content(
        role="user",
        parts=[types.Part.from_text(text=user_message)],
    )

    final_response = ""
    async for event in runner.run_async(
        user_id=user_id, session_id=session.id, new_message=content
    ):
        if hasattr(event, "content") and event.content and event.content.parts:
            for part in event.content.parts:
                if hasattr(part, "text") and part.text:
                    final_response += part.text

    return final_response, session
