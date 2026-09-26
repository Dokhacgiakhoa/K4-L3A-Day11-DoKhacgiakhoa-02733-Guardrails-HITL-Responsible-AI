# TÀI LIỆU MÔ TẢ KIẾN TRÚC GIAO DIỆN & THIẾT KẾ (UI/UX SPECIFICATION)
## DỰ ÁN: VINBANK AI CYBER ARENA — LAB DAY 11 (CONTROLLED AGENT SECURITY & GUARDRAILS)

> **Mục đích tài liệu:** Cung cấp thông số thiết kế, kiến trúc frontend, luồng tương tác (UX Flow) và cơ chế gamification mô phỏng an ninh AI để **Claude (hoặc reviewer) đánh giá, phản biện và nghiệm thu**.

---

## 1. TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)
- **Bối cảnh nghiệp vụ:** Mô phỏng hệ thống Trợ lý ảo AI của Ngân hàng số **VinBank** đối đầu với các cuộc tấn công khai thác lỗ hổng ngôn ngữ lớn (**Prompt Injection / Jailbreak**), được bảo vệ bởi **Hệ thống phòng thủ an ninh 5 lớp (5-Gate Defense Pipeline)** và cơ chế **Human-in-the-Loop (HITL)**.
- **Hình thức thể hiện:** **Gamification Cyber Futuristic** theo phong cách bộ phim khoa học viễn tưởng kinh điển **TRON: Legacy (The Grid)**. Trận đấu được chia thành 2 phe đối kháng trực diện trên sàn đấu 3D tương tác thời gian thực.
- **Mục tiêu giáo dục & trình diễn:** Giúp người xem, học viên và ban giám khảo hiểu sâu từng bước của luồng kiểm soát an ninh AI (từ khi hacker nạp prompt độc hại đến khi qua các bộ lọc đầu vào, mô hình suy luận, bộ lọc đầu ra che giấu bí mật).

---

## 2. NGÔN NGỮ THIẾT KẾ & HỆ THỐNG NHẬN DIỆN (DESIGN SYSTEM & AESTHETICS)

### 2.1. Bảng Màu Chủ Đạo (Color Palette)
| Thành phần | Mã Màu Hex | Ý nghĩa hình tượng |
| :--- | :--- | :--- |
| **RED TEAM (Kẻ tấn công)** | `#ff4500` (Cam lửa), `#ff0055` (Đỏ Neon) | Đại diện cho **CLU / Adversary** — thế lực hacker khai thác lỗ hổng AI. |
| **BLUE TEAM (Người bảo vệ)** | `#00f5ff` (Cyan Neon), `#0066ff` (Deep Blue) | Đại diện cho **TRON / Guardian** — hệ thống phòng thủ ngân hàng VinBank. |
| **THE GRID (Sàn đấu trung tâm)** | `#020409` (Deep Space), `#02050e` (Dark Void) | Lưới ma trận ảo 3D perspective, đường kẻ lưới dạ quang neon. |
| **IDENTITY DISC (Flynn's Gold)**| `#ffd166` (Vàng hoàng kim), `#ffaa00` | Đại diện cho **Đĩa dữ liệu tối cao** (nút mở tài liệu báo cáo slide). |
| **NEUTRAL TEXT** | `#ffffff`, `#e2e8f0`, `#94a3b8` | Chữ độ tương phản cao, chống lóa, viền chamfer góc cạnh vát Tron. |

### 2.2. Nghệ Thuật Chữ (Typography)
- **Orbitron Font:** Sử dụng cho các tiêu đề lớn, bảng điểm, chỉ số hiệp đấu, mang đậm chất công nghệ tương lai.
- **Chakra Petch:** Sử dụng cho nhãn nút bấm, thẻ bài chiêu thức, tên các lá chắn an ninh (đọc nhanh, dứt khoát).
- **Share Tech Mono:** Sử dụng cho dòng log telemetry, thông số kỹ thuật (ms), mã payload và mã nguồn mô phỏng.

---

## 3. BỐ CỤC KHÔNG GIAN SÀN ĐẤU (3-COLUMN ARENA ARCHITECTURE)

Toàn bộ ứng dụng được thiết kế dạng **Single Page Application (SPA)** gói gọn trong tầm nhìn toàn màn hình (`100vh`), loại bỏ hoàn toàn thanh cuộn tổng thể của trang web:

```
+----------------------------------------------------------------------------------------------------+
|                                    TACTICAL SCOREBOARD (HEADER)                                    |
| [LOGO VINBANK]   [RED THẮNG: 2]   [LƯỢT: 2/4 (■■□□)]   [MÁU VAULT: ■■■□□ 3/5]   [TIẾP TỤC ▶] [💡] |
+----------------------------------------------------------------------------------------------------+
|                                       TRON BATTLE ARENA (3 CỘT)                                    |
|                                                                                                    |
|  [ CỘT TRÁI - RED CORNER ]     |    [ CỘT GIỮA - THE GRID ARENA ]   |  [ CỘT PHẢI - BLUE CORNER ]  |
|  - Switcher Agent (Default/Adv)|    - Live Header: Đấu trường AI    |  - Header: Blue Guardian     |
|  - Target Secret Bounty        |    - Sơ đồ 4 bước Pipeline (1s/b)  |  - 5 Lá Chắn An Ninh:        |
|    (admin123, api_key, db_host)|    - Vòng tròn va chạm 3D:         |    Gate 1: Tần suất (Passed) |
|  - 5 Chiêu Thức Tấn Công (CP4):|      * Red Light Disc phóng ra     |    Gate 2: Input Guard       |
|    1. Completion Bait          |      * Blue Shield kích hoạt       |    Gate 3: Core LLM          |
|    2. Translation Bypass       |      * Vụ nổ va chạm & Phán quyết  |    Gate 4: Output Scrubber   |
|    3. Hypothetical Cyber Story |    - Khối Telemetry HUD:           |    Gate 5: Network Egress    |
|    4. Confirmation Trap        |      * Kỹ thuật Injection phân tích|  - Terminal phản hồi Bot:    |
|    5. Multi-Step Escalation    |      * Lá chắn can thiệp           |    * Câu trả lời chính thức  |
|  - 3 Câu hỏi an toàn (Benign)  |      * Độ trễ phân tích (ms)       |    * Nhãn bảo mật 100%       |
|  - Ô nhập Payload tùy chỉnh    |                                    |                               |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. CHI TIẾT CÁC MODULE CHỨC NĂNG

### 4.1. Tactical Scoreboard (Thanh Điều Khiển Tối Cao)
1. **Tiến độ đột kích:** Cố định tối đa **4 lượt** (`1/4` đến `4/4`), trực quan hóa bằng 4 vạch ánh sáng.
2. **Thanh máu năng lượng Vault:** **5 vạch máu** duy nhất tại Header. Khi Red đâm thủng lá chắn lấy được secret -> Trừ 1 vạch (đổi sang màu đỏ nhấp nháy). Khi Blue cản phá thành công -> Bảo toàn vạch máu. Không dùng điểm số XP gây loãng.
3. **Cơ chế Auto Battle & Nút TIẾP TỤC:**
   - **Tự động Pause sau mỗi lượt:** Sau khi kết thúc 1 đợt đột kích (5 bước), hệ thống tự động tạm dừng lại để người xem kịp đọc phân tích.
   - **Nút "TIẾP TỤC (LƯỢT X) ▶":** Nổi bật với hiệu ứng vàng hoàng kim (Flynn Gold), nhấp nháy mời gọi người dùng bấm để sang hiệp kế tiếp.
   - **Random chiêu thức:** Mỗi lần bấm "TIẾP TỤC", hệ thống tự động bốc ngẫu nhiên (random) 1 chiêu thức hiểm hóc khác nhau trong kho vũ khí, mang lại tính bất ngờ và kiểm thử toàn diện.
4. **Biểu tượng TRON Identity Disc (💡):** Nằm ở góc trên cùng bên phải. Khi rê chuột sẽ phát sáng hào quang neon; khi click sẽ mở Popup Slide HTML trình chiếu 6 slide báo cáo học thuật kiêm Game Manual.

### 4.2. Cột Trái — Red Adversary (Kẻ Tấn Công)
- **Vai trò Attacker thuần túy:** Tập trung hoàn toàn vào việc triển khai tấn công Prompt Injection, không bị lẫn các cấu hình phòng thủ.
- **2 Phương thức tấn công chính:**
  1. **Kho chiêu thức chuẩn hóa (Checkpoint 4):** 5 Preset tấn công hiểm hóc (Completion Bait, Translation Bypass, Hypothetical Story, Confirmation Trap, Multi-Step Escalation) và câu hỏi an toàn (Benign Queries).
  2. **Payload Tùy Chỉnh (Custom Prompt):** Ô nhập liệu cho phép người dùng tự gõ bất kỳ prompt thử thách nào để test trực tiếp hệ thống.

### 4.3. Cột Giữa — The Grid Arena & AI Security Telemetry
- **Đấu trường trung tâm Hologram (Visual Arena):**
  - Tái cấu trúc không gian thoáng đãng, loại bỏ các vòng xoay gây rối mắt và hiện tượng chữ đè icon.
  - Khi đang chiến đấu: GSAP 3 animation va chạm giữa Đĩa ánh sáng Red và Khiên Blue với nhịp 1s/bước.
  - Khi kết thúc lượt đấu: Hiển thị Thẻ Huy Hiệu Phán Quyết Hologram gọn gàng, sắc nét:
    - *Blue thắng:* Biểu tượng Khiên Cyan với nhãn `🛡️ PHÒNG THỦ THÀNH CÔNG` (Lá chắn bảo toàn hệ thống).
    - *Red thắng:* Biểu tượng Cảnh báo Đỏ với nhãn `💥 ĐỘT KÍCH THÀNH CÔNG` (Phát hiện rò rỉ dữ liệu).
- **Hộp Telemetry HUD (Đáy cột giữa):**
  - Phân tích chi tiết: *Kỹ thuật Injection được sử dụng*, *Lá chắn an ninh nào đã can thiệp*, *Độ trễ xử lý (ms)* và *Đánh giá an ninh*.

### 4.4. Cột Phải — Blue Guardian (Phòng Tuyến An Ninh VinBank)
- **Bộ Chuyển Đổi Chế Độ Phòng Vệ (Defense Mode Selector):** Được đặt chuẩn xác tại Header của Blue Guardian:
  - `Chưa Bật Guardrail`: Bot nguyên bản không có lá chắn (Checkpoint 1 & 2) ➔ Dễ bị khai thác lộ secret.
  - `Gia Cố Prompt`: Bot có Prompt Hardening (Bonus B2) ➔ Chống đòn cơ bản nhưng có thể bị đâm thủng bởi đòn nâng cao.
  - `Full 5 Lá Chắn`: Kích hoạt đủ 5 lớp an ninh của VinBank (Checkpoint 3 & 4) ➔ Bảo mật tuyệt đối 100%.

---

## 5. CÁC TIÊU CHUẨN KỸ THUẬT & ANTI-CRASH (TECHNICAL RIGOR)
1. **Frontend Stack:** Next.js 15 (App Router), React 19, Tailwind CSS v4, GSAP 3 (GreenSock Animation), Canvas-Confetti, Lucide React.
2. **Defensive Programming:**
   - Sử dụng triệt để Optional Chaining (`?.`) và Nullish Coalescing (`??`).
   - Mọi hàm random đều có fallback kiểm tra độ dài mảng (`array.length > 0`), loại trừ trường hợp `undefined`.
   - Cơ chế dọn dẹp Timer (`clearTimeout`) sạch sẽ khi unmount, ngăn chặn triệt để hiện tượng memory leak hoặc race conditions.
3. **Hiệu năng & Trải nghiệm:**
   - 60fps animation mượt mà nhờ GSAP hardware acceleration (`transform: translate3d`).
   - Tối ưu hóa DOM, không render thừa các overlay hay toast gây lag trình duyệt.
   - Hoàn toàn tương thích và hiển thị sắc nét trên cả màn hình Desktop chuẩn, Laptop và máy chiếu độ phân giải cao.

---

## 6. DANH SÁCH CHECKLIST ĐỂ CLAUDE / REVIEWER ĐÁNH GIÁ

- [x] **Tính trung thực với đề bài Lab 11:** Thể hiện trọn vẹn 5 tầng Guardrails của bài toán an ninh AI ngân hàng VinBank.
- [x] **Ý tưởng Visual & Gamification:** Phong cách TRON: Legacy độc đáo, các chiêu thức tấn công và phòng thủ trực quan.
- [x] **Nhịp điệu trải nghiệm (Pacing):** Mỗi bước diễn ra đúng 1 giây, có chế độ Pause sau mỗi hiệp để quan sát và nút "TIẾP TỤC" chủ động.
- [x] **Tính ngẫu nhiên (Unpredictability):** Random chiêu thức tấn công giúp mỗi ván đấu đều mang lại kịch bản mới lạ.
- [x] **Độ sạch của UI (Clean Design):** Không còn tình trạng lặp vạch máu, lặp chữ trạng thái hay popup che khuất nội dung.
- [x] **Tài liệu thuyết trình:** Đã tích hợp sẵn file trình chiếu `Slide_Lab_Day11.html` mở ngay từ TRON Identity Disc trên giao diện.
