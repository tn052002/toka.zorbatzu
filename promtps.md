## 0) Setup cách làm với Codex (workflow chuẩn)

* Dùng **Codex CLI** để Codex đọc/sửa/chạy code ngay trong folder dự án. ([OpenAI Developers][1])
* Hoặc dùng **Codex trong ChatGPT** (task “Code”) để giao ticket theo module; mỗi task chạy trong môi trường tách biệt đã nạp codebase. ([OpenAI][2])
* Khi cần “delegate” lâu hơn, Codex cloud/web có thể làm task trong cloud environment. ([OpenAI Developers][3])

---

# Plan build TOKA — Web mobile-first (2–3 tuần, solo builder)

## Week 1 — Ship “Moment Loop” end-to-end

### Day 1: Scaffold project (PWA-ready)

**Stack gợi ý (để nhanh):**

* Next.js + TypeScript
* Tailwind
* LocalStorage (guest mode)
* No login, no payments

**Codex task prompt**

```text
Scaffold a Next.js (TS) mobile-first web app named TOKA.
Requirements:
- Tailwind
- PWA manifest + app icon placeholders
- Routing: / (Home), /moment/domain, /moment/question, /moment/cast, /moment/result
- Mobile-first layout, calm typography, no heavy animations yet.
Add eslint + prettier. Provide run instructions.
```

### Day 2: Implement I Ching cast engine (coin)

* Coin method 6 lines (6/7/8/9)
* Build `castQuick()` random + `castRitual(step)` for 6 taps
* Map lines → primary hexagram id
* If changing lines exist → relating hexagram id

**Codex task prompt**

```text
Implement I Ching coin casting engine:
- Represent a line with value 6/7/8/9 and yin/yang + changing boolean.
- Build functions:
  castQuick(): returns 6 lines
  applyRelating(lines): returns relating lines (flip changing lines)
  linesToHexagramId(lines): returns 1..64 (King Wen order) using a mapping table
Provide tests for deterministic sample inputs.
```

> Ghi chú: mapping King Wen order phải có bảng. Làm MVP thì cậu có thể nhét mapping JSON.

### Day 3: Build the flow screens (UI skeleton)

* Home → Domain → Question → Cast (Quick/Ritual) → Result (placeholder)
* Persist “draft moment” in state (Zustand hoặc React context nhẹ)

**Codex prompt**

```text
Build mobile-first UI for the 5 screens with a single shared layout.
Add:
- Domain grid (6 options + other)
- Question textarea with gentle placeholder
- Cast screen with Quick/Ritual toggle; Ritual shows 6 slots and a tap-to-flip interaction
- Result screen sections (Pattern, Movement, Relating, Mirror, Cold sentence, Opening question) using placeholder text.
No login.
```

### Day 4–5: Add hex meaning DB (v1: 1–10 + fallback)

* Tạo `hex_meanings.json`
* Nếu hex chưa có meaning → fallback “neutral generic” (để app không crash)
* Render “Primary / Movement / Relating” từ meaning table

**Codex prompt**

```text
Add a local JSON meanings store:
- hexagram[id] => {layman_title, traditional_name, present_state[3]}
- line_position_overlay[1..6] => movement meaning bullets
Render Result screen from this store.
If id missing, show fallback neutral text.
```

### Day 6–7: AI Interpretation (mirror-only) + schema lock

* 1 endpoint `/api/interpret` nhận: domain, question, primary meaning bullets, changing line overlays, relating meaning bullets
* Response JSON theo schema cố định (như mình đã đưa)
* Add “anti-advice / anti-prediction” post-check (regex) → nếu vi phạm thì regenerate

**Codex prompt**

```text
Create /api/interpret endpoint that calls OpenAI and returns JSON strictly matching a schema.
Constraints:
- No advice, no prediction.
- Output sections: primary, movement, relating, mirror_map, cold_mirror_sentence, opening_question.
Add a post-check that rejects responses containing should/must/recommend/will happen and regenerates once.
Include typed Zod schema validation.
```

(Điểm này dựa trên cách Codex làm việc: đọc/sửa/chạy code, hợp để build endpoint + schema + tests. ([OpenAI Developers][1]))

---

## Week 2 — Save/Revisit + Polish + Telemetry (nhẹ)

### Day 8–9: Save moment (guest mode)

* Save vào LocalStorage: `moments[]`
* List simple “History” screen (optional MVP+) hoặc modal “Saved”
* Revisit: open saved moment → show result lại (không cần re-call AI nếu đã lưu output)

**Codex prompt**

```text
Implement local persistence:
- Save moment with id, created_at, domain, question, cast lines, primary/relating ids, ai_output JSON.
- Add a simple /history screen listing saved moments (date + domain + first line of question).
- Tapping opens /moment/result?id=...
```

### Day 10: Revisit reminder (in-app, không notification)

* “Revisit in 7 days” chỉ là button tạo “pin” trong history (không push)
* (Sau này mới thêm email/push)

### Day 11–12: UI polish (đọc dễ là số 1)

* Typography scale
* Spacing
* Result screen readability (đặc biệt Mirror Map)
* Ritual coin animation rất nhẹ

### Day 13–14: Add hex 11–20 (tăng coverage) + refine fallback

* Mỗi hex 3 bullet present_state, title, traditional_name

---

## Week 3 (optional) — Soft login + chuẩn bị monetization (chưa bật paywall)

### Soft login (chỉ hỏi khi Save)

* Implement auth (Supabase/Auth.js) *nhưng vẫn allow skip*
* Merge guest moments vào account khi login

### Monetization path (UI hooks only)

* Show usage counter (3–5 moments/week)
* “Pro features” page ẩn trong Settings: Unlimited + Timeline patterns
* Chưa cần tích hợp payment ngay (đừng phá trust sớm)

---

# Repo structure (để Codex hiểu nhanh)

* `app/` routes (Next.js)
* `lib/iching/` cast + mapping + tests
* `lib/meaning/` meanings json + accessors
* `lib/interpret/` schema + prompt builder + validators
* `components/` UI building blocks
* `store/` moment state
* `types/` shared types

---

# Cách “giao việc” cho Codex để không loạn

Mỗi task gửi Codex theo format:

1. **Goal** (kết quả cần)
2. **Constraints** (no advice/prediction, schema, mobile-first)
3. **Files touched** (gợi ý đường dẫn)
4. **Acceptance tests** (điều kiện pass)

Và luôn yêu cầu: “run tests + fix lint”.

---

Nếu cậu muốn mình “đóng gói” luôn cho Codex chạy mượt ngay từ phút 1, mình sẽ viết:

* 1 file `SPEC.md` (MVP requirements + schema + guardrails)
* 1 file `PROMPTS.md` (chuỗi prompts theo ngày như trên, copy/paste)

Chỉ cần cậu nói: **cậu sẽ dùng Next.js hay muốn thuần Vite + React?** (Mình nghiêng Next.js vì API route tiện cho interpret endpoint.)

[1]: https://developers.openai.com/codex/cli/?utm_source=chatgpt.com "Codex CLI"
[2]: https://openai.com/index/introducing-codex/?utm_source=chatgpt.com "Introducing Codex"
[3]: https://developers.openai.com/codex/cloud/?utm_source=chatgpt.com "Codex web"
