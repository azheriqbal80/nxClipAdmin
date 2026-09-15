# nxClip Admin — Update & Blockers (2026‑08‑20)

> **Purpose:** What the FE implemented in response to the latest backend docs
> (`admin-api-reference.md` v2 + "What the Admin Panel is for"), what those docs confirmed, and the
> items that are **blocked on the backend**. For the frontend + backend teams.
> **Verified against:** production gateway `https://api-gateway-216098834386.us-central1.run.app` (seeded admin, live probes).
> **Contract source of truth:** `docs/admin-panel-spec-and-api.md`.

---

## 1. Implemented this round ✅

| # | Item | Endpoint / Source | Verified |
|---|------|-------------------|----------|
| 1 | **Users & subscriptions dashboard card** on the Overview home — total users, active, suspended, 7d/30d signups, and FREE/PRO/STUDIO plan mix with per‑plan 30‑day signups | `GET /admin/users/stats` (live) | ✅ live (21 users, real plan mix) |
| 2 | Typed query + schema for the new stats endpoint (Zod‑validated at the client boundary) | `features/overview/api/queries.ts` | ✅ |
| 3 | Mock handler + e2e coverage for the card | `mocks/handlers/creators.ts`, `e2e/overview.spec.ts` | ✅ 28/28 e2e |
| 4 | **Dashboard home composition** documented (health · users · moderation backlog · AI queues/failed · spend) | `admin-panel-spec-and-api.md` §2.7 | ✅ |
| 5 | Single source of truth updated: route map, response shapes, suggested modules, changelog | `admin-panel-spec-and-api.md` §2.3/§2.6/§2.7/§8 | ✅ |
| 6 | Recorded the **real `costs/summary` DTO** the backend intends, so FE can switch cleanly when unblocked | §2.6 + BE‑1 | 📝 documented |

**Added 2026‑08‑25 — API coverage closed out:**

| # | Item | Endpoint / Source | Verified |
|---|------|-------------------|----------|
| 7 | **`GET /admin/users/:id`** consumed — *progressive enrichment* of the selected creator. This is the **only** source of `contentCount` / `emailVerified`; the list DTO omits both, so those inspector fields had been silently absent on live data | `features/creators/api/queries.ts` (`useCreatorDetail`) | ✅ e2e |
| 8 | **`GET /admin/content/:id`** consumed — keeps the open moderation inspector authoritative after approve/takedown without refetching the list | `features/moderation/api/queries.ts` (`useContentDetail`) | ✅ e2e |
| 9 | Safe-merge helper: detail schemas are `.partial()` and the merge skips `undefined`, so an unpublished/partial DTO (BE‑5) can neither fail validation nor blank out a field the list already supplied | `lib/merge-defined.ts` | ✅ |
| 10 | Job inspector renders **`inputPayload` / `resultPayload`** (already returned by `GET /admin/jobs`, previously discarded), with data URIs collapsed to a size summary — makes a zero-length image input visible, e.g. `«image/png URI · 0 chars»`. See §3a | `features/queues/components/job-inspector.tsx` | ✅ |
| 11 | Creator **names** resolve in Moderation / Stuck Publishing / Explore — tables *and* inspectors (client-side workaround for BE‑2) | `hooks/use-user-names.ts` | ✅ |
| 12 | Layout: full-width pages with equal gutters; detail panels open only on row-select; defined the **undefined** `--spacing-topbar` / `--spacing-sidebar` tokens (the topbar had been collapsing to 37px) | `styles/index.css`, `layout/topbar.tsx` | ✅ measured |
| 13 | **`GET /admin/plans/:plan`** consumed as a **post-save read-back**. `PUT` returns 204 with no body, so the editor re-reads the plan and reports any server-side clamping (`Daily image generations: 9,999 → 1,000`) rather than echoing the submitted value; the form resets to what was stored | `features/config/api/queries.ts` (`useUpdatePlan`) | ✅ e2e (both clamped + clean paths) |

**API coverage is now complete — every route in `admin-panel-spec-and-api.md` §2.3 is consumed.**

> **Ask for backend (§2.4):** plan-limit **clamping rules are undocumented**. The FE detects adjustments
> generically and reports them, but the valid range/ceiling per field should be specified so the editor can
> validate *before* submitting instead of discovering it after.

**Live sample from `GET /admin/users/stats`:**
```json
{ "totalUsers": 21, "activeUsers": 21,
  "byPlan": { "FREE": 20, "PRO": 1, "STUDIO": 0 },
  "signups": { "last7d": 0, "last30d": 2,
    "byPlanLast7d": { "FREE": 0, "PRO": 0, "STUDIO": 0 },
    "byPlanLast30d": { "FREE": 1, "PRO": 1, "STUDIO": 0 } } }
```

---

## 2. Confirmed by the docs (already built, now validated) ✅

| Area | Confirmation |
|------|--------------|
| Content types | `image` / `meme` / `clip` — FE treats `contentType` as an open string (fixed an earlier too‑strict enum) |
| Explore `socialRollup` | `idle \| scheduled \| publishing \| live \| failed` — treated as open string |
| Moderation nav badge | `publishing + moderation_rejected (+ generation_failed)` — matches our derived count |
| Layout / pills / out‑of‑scope | 70/30 table+inspector, status pill colors, and the deferred list (social console, model toggles) all match |

No contradictions with the current build — the docs were **additive**.

---

## 3. Blocked / pending on the backend 🚫

These gate further FE work. IDs match `admin-panel-spec-and-api.md` §2.8.

| # | Blocker | Impact on FE | Owner |
|---|---------|--------------|-------|
| **BE‑11** | **`POST /auth/login` returns 200, then `GET /auth/me` returns 401 for that same token** (repeatedly reproduced 2026‑08‑25). `POST /auth/refresh` also fails, so the SPA cannot recover — it clears the session and returns to `/login`. Likely a signing‑key / audience / issuer mismatch between the auth issuer and the gateway verifier, or a clock/expiry problem. | **Blocks all live admin use** — every page reads empty. FE refresh‑and‑retry is implemented and verified firing (`api/client.ts`, `features/auth/session.ts`); nothing further can be done client‑side. | Backend (identity / gateway) — **P0** |
| **BE‑1** | `GET /admin/costs/summary` returns **500** (still, confirmed 2026‑08‑20). Target DTO: `{ totalUsd, byDay[], byProvider[{provider,totalUsd,unitCount}], topUsers[{userId,totalUsd}] }` | AI Cost panel + Overview spend show "unavailable"; FE cost schema/UI must be **rewritten to the target DTO** once fixed (current shape is a placeholder) | Backend (ai) |
| **BE‑2** | `content` / `jobs` / `explore` item DTOs return only `userId` (no `displayName`) | Moderation, Queues, Explore, Publishing show short `userId` instead of names | Backend (identity/content/ai/feed) |
| **BE‑10** | Admin can't view **pre‑publication media** — `cdnUrl`/`thumbnailUrl` → owner‑scoped `/content/:id/media` → **403** for admin (published renders fine) | Moderation inspector can't preview draft/publishing/failed media | Backend (content) |
| **BE‑9** | Inline mode: `/admin/queues` failed counters are `0` while `/admin/jobs?status=failed` has real failures | Queue KPI failure counts derived from jobs, not queues | Backend (ai) — document/confirm |
| **BE‑8** | `GET /admin/explore?sort=` returns **400**; no `totals`/cursor | Explore sorts client‑side only | Backend (feed) — optional |
| **BE‑7** | `content_outbox` state/attempts not exposed | Stuck‑Publishing outbox columns dropped; pipeline inferred from `/admin/jobs?contentId=` | Backend (content) — optional |
| **BE‑3** | Confirm or drop moderation `priority` + `flags[]` | FE UI omitted pending decision | Backend — confirm |
| **BE‑5** | Publish response DTOs / OpenAPI for all `/admin/*` | FE schemas rest on probed snapshots, not a guarantee | Backend — hardening |
| **BE‑6** | No `queue-count` route (collides with `/content/:id`); no `total` on lists | Moderation badge derived client‑side (works; native count would be cheaper) | Backend — optional |

**Ops:** the gateway must allow the admin SPA origin in **CORS** (with credentials) for a cross‑origin deploy. Local dev proxies around this.

### 3a. Backend data‑quality finding (surfaced by the admin panel)

The **AI Queues → failed jobs** view is showing a large batch of failed **image‑generation** jobs (33+ across pages), all with the same provider error:

```
Vertex Gemini Image API error (400): { "code": 400,
  "message": "Provided image is not valid.", "status": "INVALID_ARGUMENT" }
```

- **Not an admin‑panel bug** — the panel is correctly displaying real failed jobs from `GET /admin/jobs?status=failed` (this is its purpose: triage + retry).
- **The client is not the source.** Traced the full request path in the `NxClip` client repo (2026‑08‑25). `POST /content/generate` sends **`{ prompt, style, aspectRatio, model? }` and nothing else** (`src/services/apiClient.ts:717`), and `server.ts:186` re‑validates only those fields. A repo‑wide search for `referenceImage|inputImage|imageBytes|sourceImage|initImage|img2img` returns **zero matches**; Image Studio has no file picker, no drag‑drop, and no multipart upload. **Correction:** an earlier revision of this section attributed the failure to a bad client‑supplied reference image — that is wrong, and chasing it would waste the AI team's time.
- **Therefore the rejected image is attached inside ai‑service**, between `POST /internal/queue/generate-image` and the Vertex call. Ranked hypotheses, most likely first:
  1. **An image part is always attached, even when there is nothing to attach.** Gemini image models use one `generateContent` endpoint for both generate and edit, so the `parts[]` array is built the same way; an `inlineData` part with `data: ""` (or null/placeholder) yields exactly this error. Best fit for the evidence — every failure is byte‑identical across two different users on plain text‑to‑image jobs.
  2. **Meme mode loads a template image that isn't present in the deployed container.** The client has a `mode === "meme"` branch and live content rows carry `contentType: "meme"`; a missing/unreadable template reads as zero bytes.
  3. **`retry-generation` re‑feeds a stored asset that was never written.** Content media already fails to serve for admin (BE‑10), so a retry path that reloads the prior asset would hand Vertex an empty object or an HTML error body.
  4. **Arbitrary `model` passthrough.** The client forwards any `model` string it is given (`apiClient.ts:717`); a value routing to an edit‑only model makes an image input mandatory.
- **Corroboration:** the plan‑limits contract already includes **`maxReferenceImages` — "Max reference images on generate"** (§2.4), so the generate pipeline has a first‑class reference‑image concept even though no client populates it. Consistent with hypothesis 1.
- **Retrying from the admin will not help** for any of the above — the input is invalid before Vertex sees it.
- **Action (backend/AI team):** log the exact `parts[]` array sent to Vertex for one of these jobs, then either omit the image part when there is no reference image, or validate/normalize it before enqueue and surface a clearer error. Owner: **Backend (ai / content)**.
- **FE support added (2026‑08‑25):** the job inspector now renders **`inputPayload` / `resultPayload`** (both were already returned by `GET /admin/jobs` and discarded by the UI), with data URIs and long strings collapsed to a size summary — so a zero‑length image input is visible at a glance, e.g. `«image/png URI · 0 chars»`. Copy button yields the raw uncollapsed JSON to hand to the AI team.

---

## 4. Optional next FE steps (not blocked)

- Enrich the dashboard with the **AI‑queue‑pulse + recent‑failures** widgets described in the doc (data already available).
- When **BE‑1** lands: swap the cost schema/UI to the real DTO and light up the AI Cost panel + Overview spend.

---

## 5. Quality gates (this round)

`tsc` clean · `oxlint` (3 pre‑existing warnings) · design‑system audit clean · **Playwright 32/32**
(2026‑08‑25: +4 tests covering the newly consumed `GET /admin/users/:id`, `GET /admin/content/:id`, and the
`GET /admin/plans/:plan` post‑save read‑back — clamped and clean paths).

> **Note on verification since 2026‑08‑25:** BE‑11 blocks live verification, so UI changes from that date
> are verified against the MSW mock server (`VITE_ENABLE_MOCKS=true`) and Playwright, not the live gateway.
