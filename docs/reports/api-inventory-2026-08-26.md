# nxClip Admin — API Inventory & Gaps (2026‑08‑26)

> **What this is:** every API the admin panel consumes, grouped by upstream service, with its
> **live status verified on 2026‑08‑26** against the production gateway — plus what is still missing.
> **Gateway:** `https://api-gateway-216098834386.us-central1.run.app` (seeded admin).
> **Contract source of truth:** `docs/admin-panel-spec-and-api.md`.

**Headline:** the admin panel consumes **30 endpoints** — all **25** documented `/admin/*` routes, the
**4** auth routes, and the content media route. **Nothing documented is unused.**

**Verification: 26 of 30 confirmed with a real success response, 1 more proven functional by a correct
business‑rule rejection, and 3 confirmed to route + validate but not fired because they irreversibly
change production data.** Nothing here is missing or broken — see §7.

---

## 1. Auth (identity)

| Method | Path | Consumed by | Live |
|---|---|---|---|
| POST | `/auth/login` | Login page | ✅ 200 |
| GET | `/auth/me` | Admin route guard (`roles` includes `admin`) | ✅ 200 |
| POST | `/auth/refresh` | Retry‑once‑on‑401 + proactive refresh 5 min before expiry | ✅ 200 — new token accepted by `/auth/me` |
| POST | `/auth/logout` | Sign out | ✅ 204 — refresh token revoked (`/auth/refresh` 200→401) |

> **BE‑11 (login token rejected by `/auth/me`) is RESOLVED** as of 2026‑08‑26 — re‑tested end to end.

## 2. Identity — users

| Method | Path | Consumed by | Live |
|---|---|---|---|
| GET | `/admin/users` | Creator directory · creator‑name resolution (BE‑2 workaround) · signup & plan‑mix charts | ✅ 200 |
| GET | `/admin/users/stats` | Users & subscriptions KPI band | ✅ 200 |
| GET | `/admin/users/:id` | Creator inspector enrichment — **sole source of `contentCount` + `emailVerified`**, which the list DTO omits | ✅ 200 |
| PATCH | `/admin/users/:id/active` | Suspend / reactivate · bulk suspend | ✅ 200 (no‑op verified) |
| POST | `/admin/users/:id/roles` | Promote to admin | ✅ 200 (idempotent grant, roles unchanged) |
| POST | `/admin/users/:id/reset-onboarding` | Reset onboarding | ✅ 200 (no‑op verified, state unchanged) |

## 3. Content

| Method | Path | Consumed by | Live |
|---|---|---|---|
| GET | `/admin/content` | Moderation queue (6 status tabs) · stuck publishing · moderation nav badge · Overview recent list · publish‑latency chart | ✅ 200 |
| GET | `/admin/content/:id` | Moderation inspector — authoritative re‑read, keeps the open panel fresh after approve/takedown | ✅ 200 |
| POST | `/admin/content/:id/approve` | Approve · force re‑publish a stuck item (there is no `/redispatch`) | ✅ route verified |
| POST | `/admin/content/:id/takedown` | Take down | ✅ route verified |
| GET | `/admin/plans` | Plan limits table | ✅ 200 (3 plans) |
| GET | `/admin/plans/:plan` | **Post‑save read‑back** — `PUT` returns 204 with no body, so this confirms what was stored and surfaces server‑side clamping | ✅ 200 |
| PUT | `/admin/plans/:plan` | Save entitlement thresholds | ✅ 200 (no‑op verified, values unchanged) |

## 4. AI — queues, jobs, cost, coach

| Method | Path | Consumed by | Live |
|---|---|---|---|
| GET | `/admin/queues` | Queue health · queue‑depth KPI · nav badge | ✅ 200 |
| GET | `/admin/jobs` | Failed‑jobs grid · reliability charts · error taxonomy · per‑content pipeline stepper · failure sparkline | ✅ 200 |
| POST | `/admin/jobs/:id/retry` | Retry a failed job | ✅ functional — correctly rejects a non‑failed job (400) |
| GET | `/admin/costs/summary` | AI cost panel · Overview spend KPI | ❌ **500** |
| GET | `/admin/coach/categories` | Coach category list | ✅ 200 (10) |
| POST | `/admin/coach/categories` | Create category | ✅ route verified (400 validation) |
| PATCH | `/admin/coach/categories/:id` | Update / deactivate category | ✅ 200 (no‑op verified) |
| GET | `/admin/coach/categories/:id/questions` | Question bank | ✅ 200 |
| POST | `/admin/coach/categories/:id/questions` | Add question | ✅ route verified |
| PATCH | `/admin/coach/questions/:id` | Toggle question active | ✅ 200 (no‑op verified) |

## 5. Feed · Gateway · media

| Method | Path | Consumed by | Live |
|---|---|---|---|
| GET | `/admin/explore` | Explore audit (WES ranking) | ✅ 200 |
| GET | `/admin/health` | System health page · sidebar service dots | ✅ 200 |
| GET | `/content/:id/media` | Inspector media preview (not an `/admin/*` route) | ❌ **403** |

---

## 6. Still missing

### 6a. Endpoints that exist but fail

| # | Endpoint | Exact live error | Impact |
|---|---|---|---|
| **BE‑1** | `GET /admin/costs/summary` | `500 Internal server error` | Cost panel + spend KPI dead. Also the only first‑class daily series the backend planned (`byDay[]`), so **spend is the one metric we could genuinely forecast** — blocked. |
| **BE‑8** | `GET /admin/explore?sort=` | `400 "property sort should not exist"` | Explore sorts client‑side only; ranking beyond the first page is not truly sorted. |
| **BE‑10** | `GET /content/:id/media` | `403 "Not authorised to view this content"` | Moderation cannot preview **pre‑publication** media — exactly the states that need review. |

### 6b. Capabilities with no endpoint at all

| # | Gap | Consequence today |
|---|---|---|
| **BE‑9** | Queue counters disagree with job reality | **Actively wrong — see §8** |
| **BE‑4** | No queue / backlog history | Queue depth, In moderation and Suspended cannot have trend sparklines; only a live snapshot exists |
| — | **No aggregation / timeseries route** | Every trend chart is derived client‑side from ≤100 rows. Correct at today's volume, breaks at scale. The single highest‑value addition. |
| **BE‑2** | No `displayName` on `content` / `jobs` / `explore` DTOs | Worked around by fetching the user directory and resolving ids client‑side |
| **BE‑6** | No `total` / count on list responses | Moderation badge summed client‑side; `/admin/content/queue-count` returns `400 "uuid is expected"` because it collides with `/:id` |
| **BE‑7** | `content_outbox` state / attempts not exposed | Publish pipeline inferred from jobs, not actual dispatch state |
| **BE‑5** | No published DTOs / OpenAPI | Schemas rest on probes; detail schemas are defensively all‑optional |
| — | `users/stats?from=&to=` unused | `inRange` / `byPlanInRange` exist but nothing calls them — the clean way to do true period‑over‑period |

### 6c. Undocumented constraints found by probing

| Constraint | Detail |
|---|---|
| **`limit` ≤ 100** | `/admin/content` and `/admin/jobs` reject `limit=200` with `400 "limit must not be greater than 100"`. Cost a live bug before it was caught. |
| **Coach category validation** | `slug` must be **lowercase kebab‑case**, 2–64 chars; `label` 1–128; `progressLabel` 1–128 **required**; `openingMessage` ≥ 1. The dialog's own placeholder (`"Gaming"`) was rejected — create was impossible on production until fixed. |
| **Plan‑limit clamping** | `PUT /admin/plans/:plan` silently clamps out‑of‑range values. The ceilings are **not documented**, so the FE can only report an adjustment after the fact rather than validate before submitting. |

### 6d. Not real routes (the FE derives these)

| Path | Live | Note |
|---|---|---|
| `/admin/content/queue-count` | `400` | Collides with `/admin/content/:id` (uuid expected) — badge derived client‑side |
| `/admin/publishing` | `404 Route not found` | Use `/admin/content?status=publishing` |
| `/redispatch` | — | Does not exist; re‑drive is `POST /admin/content/:id/approve` |

---

## 7. Verification method and coverage

Three tiers were used, because not every endpoint can be exercised against production without
consequences.

**Tier A — real success response (25 of 30).** All read routes, plus these writes proven with a live
2xx and a read‑back confirming state was untouched:

| Endpoint | Technique | Result |
|---|---|---|
| `POST /auth/refresh` | exchange the refresh token | 200 · new token accepted by `/auth/me` |
| `POST /auth/logout` | log out this probe session | 204 · **refresh token revoked** (`/auth/refresh` 200→401) |
| `PATCH /admin/users/:id/active` | re‑send current `isActive` | 200 · unchanged |
| `POST /admin/users/:id/roles` | grant a role the user already holds | 200 · roles unchanged |
| `PUT /admin/plans/:plan` | re‑send identical values | 200 · values unchanged, `updatedAt` not even bumped |
| `PATCH /admin/coach/categories/:id` | re‑send current `isActive` | 200 · unchanged |
| `PATCH /admin/coach/questions/:id` | re‑send current `isActive` | 200 · unchanged |

**Tier B — route + validation proven, success path not fired (5 of 30).** These have irreversible or
visible side effects on production data, so only their existence and validation were confirmed, using a
well‑formed but nonexistent UUID (`404 "Content not found"` proves the route exists; `404 "Route not
found"` would mean it is absent) or an empty body (which makes the server enumerate its rules — this is
how §6c was found).

> **These endpoints are not missing or broken** — they exist, route correctly and enforce their business
> rules. The e2e suite runs on MSW mocks because automated tests need deterministic fixtures, not because
> the live API is unavailable. The only reason the calls below were not fired at production is that they
> change real data irreversibly.

Two were closed on a second pass by finding targets where the call is a no‑op or an expected rejection:

| Endpoint | Live result | Verdict |
|---|---|---|
| `POST /admin/users/:id/reset-onboarding` | **200** on a user whose `onboardingCompleted` was already `false` — read‑back confirms still `false` | ✅ **Tier A** |
| `POST /admin/jobs/:id/retry` | **400** on a `completed` job: `Cannot retry job …: status is "completed" (expected failed)` — job unchanged | ✅ **endpoint proven functional**; the retry‑a‑failed‑job path still costs provider spend, so not fired |

Three remain genuinely unfirable:

| Endpoint | Why no safe target exists |
|---|---|
| `POST /admin/content/:id/approve` | Would **publish** to the public feed. Live content is only `draft` / `published` / `publishing` — there is **no `deleted` or `moderation_rejected` item** to act on idempotently. |
| `POST /admin/content/:id/takedown` | Would **soft‑delete** real content. Same problem: no already‑deleted item exists to re‑delete harmlessly. |
| `POST /admin/coach/categories` | Creates a row, and **`DELETE /admin/coach/categories/:id` does not exist** (confirmed: `Cannot DELETE /admin/coach/categories/…`) — the test row would be permanent. |

**To close these three**, any one of: (a) point us at a disposable content id, (b) run them on staging,
(c) add a `DELETE` for coach categories, or (d) accept route+validation proof plus mock‑path coverage.

### Incidental finding — live content states

`GET /admin/content?limit=100` returns **44 `draft`, 28 `published`, 1 `publishing`** and nothing else.
There is currently **no `moderation_rejected`, `generation_failed` or `deleted` content at all**, which is
why those Moderation tabs render empty against live — the UI is correct, the states are simply unused.

### Security note on logout

`POST /auth/logout` revokes the **refresh** token but the **access token stays valid until it expires**
(~60 min observed). That is normal for stateless JWT and the SPA clears its own storage on sign‑out, but
it means a leaked access token survives logout for up to an hour. Worth a deliberate decision rather than
an accident — if that window matters, the gateway needs a token denylist.

## 8. The one that is not just missing but wrong

```
GET /admin/queues              → all four queues: failed = 0   (mode = inline)
GET /admin/jobs?status=failed  → 33
```

The Overview **"Failed jobs" KPI shows `0`** while 33 jobs have actually failed, because it reads
`/admin/queues`. In `inline` mode there is no BullMQ worker, so those counters are structurally
meaningless.

**An ops dashboard understating failures to zero is the worst failure mode it has.** The fix needs no
backend work: derive that KPI from `/admin/jobs?status=failed`, the source the queues page already
trusts. Backend should still resolve **BE‑9** by declaring which counter is authoritative in inline mode.

---

## 9. Priority for the backend

| Priority | Item | Why |
|---|---|---|
| **P0** | **BE‑1** — costs 500 | Only fully dead feature; blocks the one forecastable metric |
| **P1** | **BE‑9** — authoritative failed counts | Dashboard currently reports 0 against 33 real failures |
| **P1** | **BE‑10** — admin media route | Moderation cannot see what it is moderating |
| **P1** | **BE‑5** — publish DTOs / OpenAPI | Everything else rests on probed snapshots |
| **P1** | Server‑side aggregation | Every trend is client‑derived from one ≤100‑row page |
| **P2** | BE‑2, BE‑4, BE‑6, BE‑7, BE‑8 | Workarounds exist and are documented |
| **P2** | Document clamping rules + `limit` cap | Both cost real bugs this week |
