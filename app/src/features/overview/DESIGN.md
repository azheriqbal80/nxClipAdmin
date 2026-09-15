# Overview implementation

The authenticated `/` page implements the complete Overview design approved on September 10, 2026. The approved reference captures are in `test-results/overview-complete/` at the project root. `/overview-example` remains the synthetic demonstration route.

The visual identity is the approved charcoal/navy canvas, flat bordered panels, General Sans, violet actions, muted Free bars, purple Pro bars, and teal Studio bars. Global theme values live in `src/styles/index.css`; `design/base.css` and `design/layout.css` contain Overview composition and preview framing only. `design/live.css` adapts the page to the authenticated scroll container. The preview imports the same styles and analytic components, so the two surfaces do not maintain separate implementations of those parts.

## Reading path

Operational metrics lead: moderation, queue depth, failed jobs, and 30-day spend. A publishing shortcut follows when publishing records exist. Recent moderation and quick access share the next row, with expandable service health below quick access. Users and plan distribution form the third group, followed by signup volume and cohort paid adoption.

The shared authenticated shell owns the sidebar, topbar, mobile drawer, route selection, real account menu, and sign-out. Every authenticated route receives the approved shared shell. Overview uses the existing Panel, PageHeader, Button, SearchInput, and Table components; its feature styles do not redefine theme values. All configured navigation destinations remain available. The synthetic notification indicator and workspace plan badge are absent because their sample values do not represent authenticated data. Moderation search sits inside its table panel and supports Ctrl/Cmd+K.

The main content retains the shell's scroll container. In-page section tracking observes that container. The shell changes to a mobile drawer below 1024px. Moderation becomes full-width below 1200px, analytic panels stack below 768px, and the table scrolls inside its panel. The composition supports collapsed desktop navigation.

## Data mapping

| Display | Existing API source and behavior |
| --- | --- |
| Moderation count and table | Three `/admin/content` status requests, 50 records each; deduplicated and sorted by creation date. Pagination produces a `+` indicator. Any failed status makes the moderation snapshot unavailable. |
| Publishing shortcut | Count from the same publishing response; describes publishing state without inventing an age/stall threshold. |
| Queue depth | `/admin/queues`: waiting + active + delayed, with the individual counts in details. |
| Failed jobs | `/admin/jobs?status=failed&limit=100`; count comes from actual jobs, with a `+` if more exist. |
| Spend | `/admin/costs/summary`: USD spend and comparison with the preceding 30 days. |
| Users and plans | `/admin/users/stats`: total, active, suspended, current plans, and signup aggregates. |
| Signup comparisons | Two ranged `/admin/users/stats` requests for the preceding equal-length windows. Missing comparisons do not become zero. |
| Growth and creator labels | A bounded `/admin/users?limit=100` response. Names and usernames are used when present, otherwise the creator ID remains visible. |
| Health | `/admin/health`: service names and up/down states derived from `ok`, with no invented latency or degraded-service counts. |

Growth defaults to loaded history and offers rolling 7-day and 30-day windows relative to the directory snapshot. It preserves current-plan semantics, gap-filled buckets, small-cohort muting, and the newest-cohort maturity warning. The overall paid percentage comes from all-user aggregate counts, independently of the directory's success. A capped sample is disclosed explicitly.

Every query has its own loading/error state and retry control. Healthy sections remain usable if another query fails. The header timestamp represents the oldest loaded section, so a health poll does not imply that all counts just refreshed. Refresh refetches all Overview queries.

Search, status filters, and selection operate on the loaded moderation snapshot. Show more reveals additional matches. Content and metric drawers restore focus to their initiating controls. Full moderation actions remain in the existing moderation module.

CSV exports include actual values, capped-count markers, explicit unavailable values, creator IDs, and a scope note. User-generated cells are escaped and protected against spreadsheet formula interpretation. Report export includes all loaded moderation records; content export uses selected rows or the current filter results.

## Validation

Implementation checks completed September 11, 2026: production build, application TypeScript build, TypeScript checking for the updated Overview/health browser specs, scoped lint, palette validation, design-system audit, and layout detector. Eight data regression tests passed. The source review's metric-inspector error-state finding was fixed and verified in source; no source findings remain. Existing Vite configuration and bundle-size warnings remain.

`node --test tests/overview-data.test.mjs` checks failure handling, capped/deduplicated moderation, rolling chart windows, identity/date fallbacks, distinct query states, CSV quoting, formula protection, and unavailable export values.

The existing Overview/health browser specs remain available. Browser access recovered on September 11, 2026. Manual browser verification passed for the shared theme on Overview, Moderation, Creators, Settings, login, account-menu portals, and the synthetic preview. At a 1440px viewport, the rail was 240px wide; neutral borders resolved to rgb(40, 43, 57), panels to 12px corners, and fields/menus to 8px corners across the inspected routes. At 390px, Overview and Settings had no document overflow; the mobile navigation opened, navigated, closed, and restored focus. Overview selection, content inspection, settled focus restoration, search, clear-search, and dummy sign-out/sign-in were exercised successfully. The preview uses AppShell and has one main landmark. No browser console errors were reported in these checks.

The full automated browser suite was not executed. Existing Vite configuration/chunk-size warnings and component Fast Refresh lint warnings remain.