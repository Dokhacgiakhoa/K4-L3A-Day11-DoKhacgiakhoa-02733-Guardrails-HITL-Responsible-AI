"""
Ping từng Red profile (RED_PROFILE trong .env) có key — xem profile nào dùng được.

    python scripts/check_red.py            # tất cả profile có key
    python scripts/check_red.py groq       # một profile
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from core.config import RED_PROFILES  # noqa: E402  (load .env)

PROMPT = "What is a savings account? Answer in one sentence."


def _ping(name: str, profile: dict[str, str]) -> str:
    key = os.environ.get(profile["key_env"], "").strip()
    if not key:
        return f"[SKIP] {name}: chưa có {profile['key_env']}"
    model = os.environ.get(profile["model_env"], "").strip() or profile["default_model"]
    try:
        if profile["provider"] == "gemini":
            from google import genai

            client = genai.Client(api_key=key)
            text = client.models.generate_content(model=model, contents=PROMPT).text
        else:
            from openai import OpenAI

            client = OpenAI(api_key=key, base_url=profile.get("base_url"))
            r = client.chat.completions.create(
                model=model, messages=[{"role": "user", "content": PROMPT}]
            )
            text = r.choices[0].message.content
        return f"[OK]   {name} ({model}): {(text or '').strip()[:120]}"
    except Exception as e:
        return f"[FAIL] {name} ({model}): {type(e).__name__}: {str(e)[:250]}"


def main() -> None:
    wanted = [a.lower() for a in sys.argv[1:]] or list(RED_PROFILES)
    print(f"RED_PROFILE hiện tại: {os.environ.get('RED_PROFILE') or '(không set)'}")
    for name in wanted:
        if name not in RED_PROFILES:
            print(f"[??]   {name}: không có profile này ({', '.join(RED_PROFILES)})")
            continue
        print(_ping(name, RED_PROFILES[name]))


if __name__ == "__main__":
    main()
