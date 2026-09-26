# Backend API — hợp đồng cho giao diện demo

Chạy backend (từ gốc repo, đã kích hoạt `.venv`):

```bash
python src/api/server.py            # http://127.0.0.1:8000
```

- CORS mở (`*`) nên frontend chạy ở origin khác vẫn gọi được.
- Nếu tồn tại `web/index.html` ở gốc repo, server phục vụ luôn giao diện tại `/`
  (gọi API bằng đường dẫn tương đối `/api/...`, không cần cấu hình gì thêm).
- Swagger tự sinh: `http://127.0.0.1:8000/docs`.

## Ba chế độ (`mode` / `target`)

| Giá trị | Ý nghĩa | Kỳ vọng khi demo |
|---|---|---|
| `blue` | Blue **có** guardrails (rate limit → input → LLM → output) | Tấn công bị chặn, `leaked: false` |
| `red` | Red mềm, **không** guardrails | Dễ `leaked: true` |
| `red_advance` | Red Advance, guardrails mạnh | Thường `leaked: false` |

## Endpoints

### `GET /api/health`
```json
{ "status": "ok", "uptime_s": 12.3,
  "blue_model": "openrouter:liquid/lfm-2.5-2.6b:free",
  "red_model": "gemini:gemini-3.5-flash",
  "keys_present": { "openrouter": true, "red": true },
  "modes": ["blue", "red", "red_advance"] }
```

### `POST /api/chat`
Body: `{ "message": "...", "user_id": "web-user", "mode": "blue" }`

Response (mọi mode cùng một dạng):
```json
{ "mode": "blue", "input": "...", "response": "...",
  "blocked": true,
  "layer": "input_guardrail",
  "leaked": false,
  "error": null, "request_id": "a1b2c3d4e5f6", "latency_ms": 12.4 }
```
- `layer`: `null` (không bị chặn) · `"rate_limit"` · `"input_guardrail"` ·
  `"output_guardrail"` (câu trả lời bị che secret) · `"error"` (LLM lỗi).
- `blocked`: chỉ `blue` mới có thể `true`. `red`/`red_advance` luôn `false`
  (dựa vào `leaked` để biết có lộ secret hay không).
- `leaked`: `true` nếu response chứa secret trong `data/protected/vinbank_secrets.json`.
- Rate limit là **theo `user_id`** (mặc định 10 request / 60 giây). Muốn demo rate limit,
  gửi > 10 tin liên tiếp với cùng `user_id`.
- Lỗi LLM **không** trả HTTP 5xx: `error` có nội dung, `response` bắt đầu bằng `[LLM unavailable]`.

### `GET /api/attack-prompts`
5 prompt tấn công CP4: `[{ "id": 1, "category": "...", "input": "..." }, ...]`

### `POST /api/attack`
Body: `{ "target": "red", "prompt_id": 1 }` hoặc `{ "target": "blue", "prompt": "tuỳ ý" }`.
Response giống `/api/chat` (target ↔ mode).

### `GET /api/attack-suite?target=red`
Chạy cả 5 prompt tuần tự (**5 lượt gọi LLM, có thể vài chục giây**).
```json
{ "target": "red", "total": 5, "leaked": 3, "blocked": 0,
  "results": [ { "id": 1, "category": "...", "leaked": true, "...": "như /api/chat" } ] }
```

### `GET /api/metrics`
```json
{ "total_requests": 8, "blocked_requests": 4, "block_rate": 0.5,
  "rate_limit_hits": 2, "judge_checks": 0, "judge_fails": 0, "judge_fail_rate": 0.0,
  "alerts": [ { "metric": "block_rate", "value": 0.75, "threshold": 0.5, "message": "..." } ] }
```
Chỉ tính request qua `blue`.

### `GET /api/audit?limit=50`
`{ "total": 8, "logs": [ { "request_id", "user_id", "input", "output", "blocked",
"layer", "latency_ms", "started_at", "finished_at" } ] }` — mới nhất trước.

### `POST /api/reset`
Xoá rate-limit window, audit và metrics → `{ "status": "reset" }`.

### `GET /api/egress-check?destination=...&payload=...`
`{ "destination": "...", "allowed": true|false }` — minh hoạ rule egress
(chỉ HTTPS + `api.vinbank.example` / `cases.vinbank.example`, payload không secret/PII).

### Kết quả lab đã sinh (404 nếu chưa chạy lệnh tương ứng)
| Endpoint | File |
|---|---|
| `GET /api/results` | `outputs/results.json` (`python src/main.py --part 3`) |
| `GET /api/attack-results` | `outputs/attack_results.json` (`python src/main.py --part 4`) |
| `GET /api/grade-report` | `outputs/grade_report.json` (`python scripts/grade.py ...`) |

## Gợi ý màn hình demo
1. **Chat song song** Blue ⇄ Red: cùng một prompt tấn công gửi cả hai, hiển thị
   `blocked` / `layer` / `leaked` dưới dạng badge.
2. **Bảng lớp phòng thủ**: rate_limit → input_guardrail → LLM → output_guardrail,
   tô sáng lớp trả về trong `layer`.
3. **Live metrics + alerts** (poll `/api/metrics`), **audit log** (poll `/api/audit`).
4. Nút **"Run 5 attacks"** (`/api/attack-suite`) cho Red và Blue để so sánh.
5. Nút **Reset** (`/api/reset`) trước mỗi lần demo.
