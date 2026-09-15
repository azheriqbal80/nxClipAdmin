# nxClip Admin — API Endpoint Status Report

> **Date:** 2026-08-07
> **Audience:** management + backend team
> **Verified against:** production gateway `https://api-gateway-216098834386.us-central1.run.app` (seeded admin, live probes)
> **Contract source of truth:** `../admin-panel-spec-and-api.md` (route map, request/response shapes, field-level detail).
> This is the single admin status report — earlier working docs (reconciliation, design-map, standalone prompt) were folded into this file + the spec doc.

## Executive summary

The admin panel front-end **runs against the live gateway by default** (real login with the seeded admin;
MSW mocks are opt-in for e2e/offline only). It is built and working for every module whose backend
endpoint works. Of the 24 wired endpoints:

- **Every read screen renders real gateway data** — Auth, Creator Directory, Content Moderation, AI Queues,
  Explore, System Health, Stuck Publishing, Plan Limits, AI Coach.
- **One area is blocked entirely on the backend:** anything cost-related (`/admin/costs/summary` returns **500**).
- **Mutations** (approve, takedown, retry, role changes, plan/coach edits) are wired to their real routes but
  were **not fired against production** during verification (they change live data).

The remaining work is **all backend** — captured as BE-1…BE-11 below and in the Cursor prompt appended at the end.

> ⚠️ **As of 2026-08-25, live admin access is blocked by BE-11**: `/auth/login` returns a token that
> `/auth/me` immediately rejects (401), and `/auth/refresh` fails too, so the SPA bounces to `/login` and
> every page reads empty. The endpoint statuses below were probed on 2026-08-07 when auth still worked.

## Legend

| FE status | Meaning |
|---|---|
| ✅ **Live** | Cut over to the real DTO and **verified rendering real data** in the browser |
| 🟢 **Live-ready** | Wired to the real route; not fired against prod (mutation) — shape aligned |
| 🆕 **Built-live** | New module, built to the confirmed live shape and verified |
| 🚫 **Blocked** | Endpoint returns 500 — cannot be used until backend fixes it |

Gateway column: ✅ 200 verified · ❌ error · *not probed* = side-effecting call not fired against prod.

---

## 1. Auth
| Endpoint | Method | Gateway | FE status | Notes |
|---|---|---|---|---|
| `/auth/login` | POST | ✅ 200 | ✅ Live | Seeded admin; returns `{ user, accessToken, refreshToken }` |
| `/auth/me` | GET | ❌ **401** (2026-08-25) | 🚫 Blocked | Rejects the token `/auth/login` just issued — **BE-11**. Was ✅ 200 on 2026-08-07 |
| `/auth/refresh` | POST | ✅ | 🟢 Live-ready | Retry-once-on-401 + proactive refresh |
| `/auth/logout` | POST | *not probed* | 🟢 Live-ready | — |

## 2. Creator Directory (Identity)
| Endpoint | Method | Gateway | FE status | Notes |
|---|---|---|---|---|
| `/admin/users` | GET | ✅ 200 | ✅ Live | 21 creators; paginated DataGrid (sort/filter/multi-select); `emailVerified`/`contentCount` optional |
| `/admin/users/stats` | GET | ✅ 200 | ✅ Live | Powers the Overview **Users & subscriptions** card (total/active/plan mix/7d·30d signups) |
| `/admin/users/:id/active` | PATCH | *not probed* | 🟢 Live-ready | `{ isActive }` |
| `/admin/users/:id/roles` | POST | *not probed* | 🟢 Live-ready | Body fixed to `{ role, action }` |
| `/admin/users/:id/reset-onboarding` | POST | *not probed* | 🟢 Live-ready | — |

## 3. Content Moderation
| Endpoint | Method | Gateway | FE status | Notes |
|---|---|---|---|---|
| `/admin/content` | GET | ✅ 200 | ✅ Live | 50 items rendered; creator = `userId` pending **BE-2**; `priority`/`flags` dropped (**BE-3**) |
| `/admin/content/:id/approve` | POST | *not probed* | 🟢 Live-ready | — |
| `/admin/content/:id/takedown` | POST | *not probed* | 🟢 Live-ready | Body `{ reason }` |
| `/admin/content/queue-count` | GET | ❌ 400 (no route) | ✅ derived | Route collides with `/content/:id` → 400. Badge now **counts review-status items client-side** (publishing + moderation_rejected + generation_failed). Optional native count = **BE-6** |

## 4. AI Queues & Cost
| Endpoint | Method | Gateway | FE status | Notes |
|---|---|---|---|---|
| `/admin/queues` | GET | ✅ 200 | ✅ Live | `mode:inline`, 4 queues; failed counters 0 in inline mode (**BE-9**) |
| `/admin/jobs` | GET | ✅ 200 | ✅ Live | 9 failed jobs rendered with real error + correlationId |
| `/admin/jobs/:id/retry` | POST | *not probed* | 🟢 Live-ready | — |
| `/admin/costs/summary` | GET | ❌ **500** | 🚫 Blocked | **BE-1** — cost panel shows "unavailable" |

## 5. Explore Audit
| Endpoint | Method | Gateway | FE status | Notes |
|---|---|---|---|---|
| `/admin/explore` | GET | ✅ 200 | ✅ Live | 29 projections; flat `likeCount`/`commentCount`; `socialRollup` shown; `?sort=` → 400 so sort is client-side (**BE-8**) |

## 6. System Health
| Endpoint | Method | Gateway | FE status | Notes |
|---|---|---|---|---|
| `/admin/health` | GET | ✅ 200 | ✅ Live | 6 services; live up/down + HTTP code + probe URL |

## 7. Stuck Publishing (re-pointed)
| Endpoint | Method | Gateway | FE status | Notes |
|---|---|---|---|---|
| `/admin/content?status=publishing` | GET | ✅ 200 | ✅ Live | Re-pointed from the phantom `/admin/publishing`; 1 live item |
| `/admin/jobs?contentId=` | GET | ✅ 200 | ✅ Live | Inspector pipeline enrichment (real moderation/generation status per item) |
| `/admin/content/:id/approve` | POST | *not probed* | 🟢 Live-ready | Re-pointed from the phantom `/redispatch` (force-approve re-drives publish) |
| *(outbox status / attempts)* | — | — | ⚠️ not exposed | `content_outbox` internals unavailable; lag derived from `createdAt` (**BE-7**) |

## 8. Global Config — Plan Limits
| Endpoint | Method | Gateway | FE status | Notes |
|---|---|---|---|---|
| `/admin/plans` | GET | ✅ 200 | 🆕 Built-live | 3 plans rendered (FREE/PRO/STUDIO), `-1`→∞ |
| `/admin/plans/:plan` | PUT | *not probed* | 🟢 Live-ready | Full threshold editor |

## 9. Global Config — AI Coach
| Endpoint | Method | Gateway | FE status | Notes |
|---|---|---|---|---|
| `/admin/coach/categories` | GET | ✅ 200 | 🆕 Built-live | 5 categories rendered |
| `/admin/coach/categories` | POST | *not probed* | 🟢 Live-ready | "New category" dialog (create) |
| `/admin/coach/categories/:id` | PATCH | *not probed* | 🟢 Live-ready | Edit label/opening/progress/sortOrder/isActive |
| `/admin/coach/categories/:id/questions` | GET | ✅ 200 | ✅ Live | Question bank drill-in (Q1–Q5 + chips) |
| `/admin/coach/categories/:id/questions` | POST | *not probed* | 🟢 Live-ready | "Add question" inline form (create) |
| `/admin/coach/questions/:id` | PATCH | *not probed* | 🟢 Live-ready | Toggle question active |

## 10. Overview (landing) — aggregates
| Source | Gateway | FE status | Notes |
|---|---|---|---|
| `/admin/content?status=publishing` (needs-attention) | ✅ 200 | ✅ Live | — |
| `/admin/queues` (depth/failed) | ✅ 200 | ✅ Live | Derived client-side |
| moderation badge count | ✅ 200 | ✅ derived | Sums review-status content items client-side (no queue-count route) |
| `/admin/costs/summary` (spend) | ❌ 500 | 🚫 Blocked | **BE-1** |

---

## Rollup

| State | Count | Endpoints |
|---|---|---|
| ✅ Live (verified rendering real data) | 10 GETs | users, content, queues, jobs, explore, health, plans, coach categories, coach questions, publishing filter |
| 🟢 Live-ready (mutations, real routes, unfired) | 11 | active, roles, reset-onboarding, approve, takedown, retry, plan PUT, category POST/PATCH, question POST/PATCH |
| 🆕 Built-live (new modules) | Plans, Coach | shipped this cycle |
| 🚫 Blocked (backend 500) | 1 | costs/summary |
| ✅ Worked around (FE-derived, no backend needed) | queue-count | badge counts review-status content client-side |

**Bottom line:** the front-end is feature-complete and live against the gateway. The only user-visible gap
is the cost panel, blocked solely on the backend `/admin/costs/summary` 500.

---

## Backend action items

| # | Ask | Priority | Blocks |
|---|---|---|---|
| **BE-11** | **Login token rejected by `/auth/me`** — `POST /auth/login` → 200, then `GET /auth/me` → **401** for that same token; `/auth/refresh` also fails so the SPA cannot recover. Reproduced repeatedly 2026-08-25. Suspect signing-key / audience / issuer mismatch between the auth issuer and the gateway verifier, or clock/expiry | **P0** | **Everything** — all live admin use; every page reads empty |
| **BE-1** | Fix `GET /admin/costs/summary` **500** | **P0** | AI Cost panel + Overview spend |
| **BE-2** | Add `displayName` (ideally `username`) to `content`, `jobs`, `explore` item DTOs | **P1** | Creator identity on 5 screens (shows short `userId` today) |
| **BE-3** | Confirm or drop moderation `priority` + `flags[]` | P2 | Moderation UI (currently omitted) |
| **BE-4** | Provide queue KPI trend source (jobs-today / failed-over-time) or confirm none | P2 | Queue/Overview sparklines (removed) |
| **BE-5** | Publish response DTOs / OpenAPI for all `/admin/*` (esp. content, explore, jobs, costs) | **P1** | Locks FE schemas against silent drift |
| **BE-6** | Add a moderation queue-count source (`/admin/content/queue-count` or a `total`) | P2 | Nav badge (falls back to 0) |
| **BE-7** | Confirm stuck-publishing = `content?status=publishing`; expose outbox state/attempts or confirm dropped; confirm re-drive = `approve` | P2 | Stuck Publishing outbox columns (dropped) |
| **BE-8** | `GET /admin/explore?sort=` returns **400** — accept `sort` (+ pagination) or document client-side only | P2 | Explore server-side ranking |
| **BE-9** | Inline-mode: `/admin/queues` failed counters are 0 while `/admin/jobs?status=failed` has real failures — document authoritative counts | **P1** | Accurate failure KPIs |
| **BE-10** | Admin can't view **pre-publication media** — `/content/:id/media` is owner-scoped. Published renders; `publishing`/`draft`/`failed`/`rejected` → **403** for admin (the states moderation must preview). Add `/admin/content/:id/media` or a signed URL on the admin DTO | **P1** | Media preview in Moderation inspector |

**Ops prerequisite:** the gateway must allow the admin SPA origin in **CORS** (with credentials). Local dev
currently proxies around this; a deployed SPA needs real CORS headers.

---

# Appendix — Cursor prompt for the backend team

> Paste everything below the line into Cursor **in the backend monorepo**. It asks for the one thing the
> front-end is missing — the response DTO for every `/admin/*` route — plus the specific fixes/confirmations
> above. Keeping it in-repo lets Cursor read the real controllers/DTOs instead of guessing.

---

## Context (read first)

You are documenting the **Admin Panel API** for the frontend team. The frontend is already built against
these routes, but it is currently guessing at response shapes because our existing doc
(`docs/api/admin-api-reference.md` / the route map) lists **routes and request bodies only** — it does
**not** document what each endpoint *returns*.

The FE team reconstructed response shapes by probing the live gateway
(`https://api-gateway-216098834386.us-central1.run.app`), but a probe is a one-time snapshot, not a
guarantee. If a field gets renamed or dropped, the FE breaks silently at runtime.

**Your job is primarily DOCUMENTATION:** produce a definitive **response-contract document** for every
`/admin/*` endpoint, sourced from the actual controller/DTO/serializer code in this repo — not from
guesses. Where the code and the route map disagree, the **code is the source of truth**; flag the
disagreement. A small number of **code changes** are also requested — but they are listed separately in
their own section so they don't get mixed into the documentation pass.

## How to verify your output against the live gateway

You can (and should) check that what you document matches what the deployed gateway actually returns.

| Environment | Base URL |
|-------------|----------|
| Production (GCP Cloud Run) | `https://api-gateway-216098834386.us-central1.run.app` |
| Local | `http://localhost:5000` |

Obtain an admin token (seeded admin, enabled in Development or via `ADMIN_SEED_ENABLED=true`):

```http
POST {base}/auth/login
Content-Type: application/json

{ "email": "admin@nxclip.com", "password": "Admin123!" }
```

Use the returned `accessToken` as `Authorization: Bearer <token>` on every `/admin/*` call, and confirm
`GET {base}/auth/me` shows `roles` including `admin`. For each endpoint you document, hit it once and make
sure the documented DTO matches the real body. Gateway Swagger lives at `{base}/docs`.

## What "response DTO" means here (the deliverable)

For **each** endpoint below, document:

1. **HTTP method + full path** (incl. query params and their types/defaults).
2. **Request body shape** (if any) — field names + types + which are required.
3. **Response body shape (the DTO)** — this is the missing piece. Give:
   - every field name,
   - its type (`string`, `number`, `boolean`, ISO-8601 `string`, enum with the exact allowed values, nested object, array),
   - whether it is **always present** or **optional/nullable**,
   - for list endpoints: the pagination wrapper (`items[]` + `nextCursor`? or `cursor`? or `total`? — document exactly what is returned).
4. **One realistic example response** (real field values, can be anonymized).
5. **Error responses** — status codes + error body shape (esp. `401`, `403`, `404`, `500`).

Prefer to emit this as an **OpenAPI 3 spec** for the `/admin/*` routes (the gateway already exposes
`/docs` — make sure it is accurate and complete for admin), **and** a human-readable markdown mirror at
`docs/api/admin-api-responses.md`. If OpenAPI generation isn't wired for these controllers, wire it or
hand-write the markdown; either way the response DTOs must be complete.

---

## Endpoints to document (group by module)

### Identity — users
- `GET /admin/users?q=&cursor=&limit=`
- `GET /admin/users/:id`
- `PATCH /admin/users/:id/active` — body `{ isActive: boolean }`
- `POST /admin/users/:id/roles` — body `{ role, action }`
- `POST /admin/users/:id/reset-onboarding`

### Content — moderation + plans
- `GET /admin/content?status=&cursor=&limit=`  (document every allowed `status` value)
- `GET /admin/content/:id`
- `POST /admin/content/:id/approve`
- `POST /admin/content/:id/takedown` — document expected request body (reason?) and response
- `GET /admin/plans`
- `GET /admin/plans/:plan`
- `PUT /admin/plans/:plan`

### Feed — explore
- `GET /admin/explore?cursor=&limit=`

### AI — queues / jobs / costs / coach
- `GET /admin/queues`
- `GET /admin/jobs?status=&queue=&userId=&contentId=&cursor=&limit=`
- `POST /admin/jobs/:id/retry`
- `GET /admin/costs/summary?from=&to=`
- `GET /admin/coach/categories` / `POST` / `PATCH /admin/coach/categories/:id`
- `GET|POST /admin/coach/categories/:id/questions` / `PATCH /admin/coach/questions/:id`

### Gateway — health
- `GET /admin/health`

---

## Questions to answer IN THE DOC (documentation only — no code changes)

Please answer each of these explicitly in the document (don't leave them implicit). None of these require
changing behavior — they are about writing down what is already true, or confirming intent:

**Confirm-or-drop (FE has UI for these; needs a yes/no)**
- **Moderation `priority` and `flags[]`** — does the content DTO include a moderation priority and/or a
  flags/reasons array today? Will it ever? If not, the FE will remove that UI.
- **Queue KPI trends** — is there any existing source for "jobs today" / "failed over time" trend data, or
  should the FE derive everything from the current `/admin/queues` depths only?

**Routes the FE calls that are NOT in the route map — confirm the correct route**
The FE currently calls three endpoints that don't appear in the documented route map. Just **tell us the
intended real route** for each (we will re-point the FE — no backend change needed unless you choose to
add one):
- `GET /admin/content/queue-count` — a count for the moderation nav badge. **Does this exist?** If not,
  should the FE derive the count from `GET /admin/content` (is a `total` returned?), or will you add a
  lightweight count endpoint?
- `GET /admin/publishing` — stuck-publishing/outbox view. We believe the intended source is
  **`GET /admin/content?status=publishing`** (the review calls it a *filter*, not a route). **Confirm**, and
  document which fields identify "stuck" (e.g. `failedAt`, `failureReason`, retry/attempt count, `jobId`).
- `POST /admin/content/:id/redispatch` — re-drive a stuck item. **Does a redispatch route exist?** If not,
  confirm the FE should use **`POST /admin/content/:id/approve`** (re-continues the publish path) and/or
  **`POST /admin/jobs/:id/retry`**, and document which one is correct for the stuck-publishing case.

**Mutation response bodies**
- For all `POST`/`PATCH`/`PUT` admin routes, document whether they return `204 No Content` or a body
  (e.g. the updated resource). The FE currently treats them as `void`.

**Newly observed live behavior (verified against the production gateway 2026-08-07 — please confirm/address)**
- **`GET /admin/explore?sort=…` returns HTTP 400.** With no `sort` param it returns a flat `{ items }`
  (no `totals`, no `nextCursor`). Decide: accept `sort=wes|recent` (and add pagination), or document that
  Explore ordering is client-side only. The FE currently sorts client-side.
- **Inline mode:** `GET /admin/queues` returns `failed: 0` (and 0 waiting/active/delayed) for every queue,
  while `GET /admin/jobs?status=failed` returns real failures. Document where the authoritative failure /
  depth counts come from in inline mode (the FE can't derive true failure totals from `/admin/queues`).
- **`GET /admin/content?status=all`** is not valid — the FE omits the `status` param to get "all". Confirm
  the intended way to request the full list, and whether a `total`/count is (or can be) returned.
- **Admin can't view pre-publication media (403).** `cdnUrl`/`thumbnailUrl` both point to
  `GET /content/:id/media`, which is **owner-scoped**. **Published** content renders fine, but
  `publishing` / `draft` / `generation_failed` / `moderation_rejected` items return **403** for the
  admin — exactly the states moderation needs to preview. Please add an admin-scoped media route
  (`GET /admin/content/:id/media`) **or** return a short-lived signed URL on the admin content DTO.

---

## Code changes requested (SEPARATE from the documentation pass)

These few items need actual code, not just docs. Please treat them as a distinct task and list them in the
changelog (see Output format §3) so the FE can react:

- **BUG — `GET /admin/costs/summary` returns HTTP 500** on the live gateway, with and without `from`/`to`.
  Find the cause in the ai-service admin cost handler, fix it, then document the working response DTO
  (aggregates by day / provider / user, and any `unit_count` / token fields). Documentation of this
  endpoint is blocked until the 500 is fixed.
- **Add creator identity to list DTOs (nice-to-have, confirm feasibility first).** The FE renders display
  name / username on moderation, explore, and jobs screens, but those DTOs return only `userId`. If cheap,
  **add `displayName` (and `username`)** to the `GET /admin/content`, `GET /admin/explore`, and
  `GET /admin/jobs` item DTOs. If not cheap, **don't change code** — instead document that the FE must
  resolve names via a separate `users` lookup, and we'll do that.

If any code change is non-trivial or risky, **do not make it** — document the current behavior and flag it
for the backend team to decide. The documentation deliverable must not be blocked on these.

---

## Cross-check against what the FE currently assumes (please confirm or correct each)

These are the shapes the FE observed by probing. Confirm they match the code, or correct them:

- **users item:** `id, email, username, displayName, plan(FREE|PRO|STUDIO), isActive, roles[], onboardingCompleted, createdAt`
  (FE also *wanted* `emailVerified`, `contentCount` — confirm whether these can be added or are out of scope).
- **content item:** `id, userId, title, description, status, contentType, prompt, basePrompt, refinePrompt, style, aspectRatio, thumbnailUrl, cdnUrl, storageKey, jobId, failureReason, failedAt, publishedAt, createdAt, updatedAt`
- **queues:** `{ mode, queues: [{ name, waiting, active, failed, delayed }] }` — confirm `mode` values and whether a `completed` count exists.
- **jobs item:** `id, jobType, queueName, bullJobId, contentId, userId, status, promptVersion, inputPayload, resultPayload, errorMessage, correlationId, createdAt, updatedAt` — confirm the enum for `status`.
- **explore item:** `contentId, userId, wesScore, socialRollup, hasLiveExternal, title, contentType, likeCount, commentCount, publishedAt, createdAt` — document the `socialRollup` shape.
- **plan item:** `plan, dailyImageGenerations, dailyUploadLimit, maxReferenceImages, maxClipOutputSeconds, maxClipSourceSeconds, maxUploadSizeMb, canUseAnalyticsReport, updatedAt` (`-1` = unlimited).
- **coach category:** `id, slug, label, openingMessage, progressLabel, sortOrder, isActive, questionCount, createdAt, updatedAt`
- **coach question:** `id, categoryId, questionNumber, message, chips[], multiSelect, isActive, createdAt, updatedAt`
- **health:** `{ status, services: [{ key, url, ok, statusCode }] }` — confirm the `status` string values.

---

## Output format required

1. **OpenAPI 3** spec covering all `/admin/*` routes (or confirm `/docs` is complete and accurate for them).
2. **`docs/api/admin-api-responses.md`** — human-readable: one section per module, a table per endpoint
   (field · type · required? · notes) + one example JSON response, and an explicit answer to every
   question above.
3. A short **changelog note** listing any DTO fields you added/renamed as part of this pass (esp. the
   costs 500 fix and any `displayName` additions), so the FE can update its schemas.

Do not invent fields. Everything documented must be traceable to the actual controller/DTO/serializer
code in this repo. Where behavior is undecided, say "undecided — FE should assume X" rather than guessing.
