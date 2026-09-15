/**
 * Probes every API the admin panel consumes against the live gateway and prints
 * a status table.
 *
 * Safety: this runs against PRODUCTION, so no probe may change real data.
 * Writes are exercised one of three ways:
 *   noop    - re-send the value the record already has, then read back to confirm
 *   probe   - fire at a well-formed but nonexistent UUID, or an empty body, so the
 *             server proves the route exists and enforces its rules without
 *             touching a row. "Content not found" = routed; "Route not found" = absent.
 *   blocked - no safe target exists; reported as such rather than guessed at
 *
 * Run: npm run api:audit        (set NX_AUDIT_JSON=path to also dump raw rows)
 */
const GW = process.env.NX_GATEWAY ?? 'https://api-gateway-216098834386.us-central1.run.app'
const EMAIL = process.env.NX_ADMIN_EMAIL ?? 'admin@nxclip.com'
const PASSWORD = process.env.NX_ADMIN_PASSWORD ?? 'Admin123!'
/** Well-formed UUID that cannot exist, for routing probes. */
const GHOST = '00000000-0000-4000-8000-000000000000'

let TOKEN = null
let REFRESH = null
const rows = []

const call = async (method, path, opts = {}) => {
  const { body, token = TOKEN, timeout = 45000 } = opts
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeout)
  const t0 = Date.now()
  try {
    const headers = {}
    if (token) headers.authorization = 'Bearer ' + token
    if (body !== undefined) headers['content-type'] = 'application/json'
    const init = { method, signal: ac.signal, headers }
    if (body !== undefined) init.body = JSON.stringify(body)
    const res = await fetch(GW + path, init)
    const text = await res.text()
    let json = null
    try { json = JSON.parse(text) } catch { /* empty or non-JSON body */ }
    return { status: res.status, json, text, ms: Date.now() - t0 }
  } catch (e) {
    return { status: 0, json: null, text: String(e.message ?? e), ms: Date.now() - t0 }
  } finally {
    clearTimeout(timer)
  }
}

/** Pull the server message out of whatever envelope it used. */
const msg = (r) => {
  const m = r.json?.message ?? r.json?.error?.message ?? r.json?.error ?? r.text
  const flat = Array.isArray(m) ? m.join('; ') : m
  return String(flat ?? '').replace(/\s+/g, ' ').slice(0, 150)
}

const ICON = { ok: 'OK  ', expected: 'OK  ', blocked: 'HOLD', absent: '--  ', fail: 'FAIL' }
const record = (group, method, path, tier, r, verdict, note) => {
  rows.push({ group, method, path, tier, status: r.status, ms: r.ms, verdict, note: note ?? '' })
  console.log('  ' + ICON[verdict] + ' ' + String(r.status).padStart(3) + ' ' +
    (r.ms + 'ms').padStart(8) + '  ' + method.padEnd(6) + ' ' + path)
  if (note) console.log('               ' + note)
}
const section = (t) => console.log('\n== ' + t + ' ' + '='.repeat(Math.max(0, 58 - t.length)))

section('auth')
{
  const r = await call('POST', '/auth/login', { body: { email: EMAIL, password: PASSWORD }, token: null })
  TOKEN = r.json?.accessToken ?? r.json?.access_token ?? r.json?.token
  REFRESH = r.json?.refreshToken ?? r.json?.refresh_token
  record('Auth', 'POST', '/auth/login', 'read', r, r.status === 200 && TOKEN ? 'ok' : 'fail', TOKEN ? '' : msg(r))
  if (!TOKEN) {
    console.error('cannot continue without a token')
    process.exit(1)
  }
}
{
  const r = await call('GET', '/auth/me')
  const roles = r.json?.roles ?? r.json?.user?.roles
  record('Auth', 'GET', '/auth/me', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? 'roles=' + JSON.stringify(roles) : msg(r))
}
{
  const r = await call('POST', '/auth/refresh', { body: { refreshToken: REFRESH }, token: null })
  const fresh = r.json?.accessToken ?? r.json?.access_token
  let note = r.status === 200 ? 'new access token issued' : msg(r)
  if (fresh) {
    const check = await call('GET', '/auth/me', { token: fresh })
    note += ', accepted by /auth/me: ' + check.status
  }
  record('Auth', 'POST', '/auth/refresh', 'read', r, r.status === 200 ? 'ok' : 'fail', note)
}

section('identity')
let USER = null
let USER_NOONBOARD = null
{
  const r = await call('GET', '/admin/users?limit=100')
  const items = r.json?.items ?? r.json?.data ?? []
  USER = items[0] ?? null
  USER_NOONBOARD = items.find((u) => u.onboardingCompleted === false) ?? null
  record('Identity', 'GET', '/admin/users', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? items.length + ' users' : msg(r))
}
{
  const r = await call('GET', '/admin/users/stats')
  record('Identity', 'GET', '/admin/users/stats', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200
      ? 'total=' + r.json?.totalUsers + ' active=' + r.json?.activeUsers + ' 7d=' + r.json?.signups?.last7d
      : msg(r))
}
{
  // The ranged variant that makes period-over-period authoritative rather than derived.
  const to = new Date().toISOString()
  const from = new Date(Date.now() - 7 * 864e5).toISOString()
  const r = await call('GET', '/admin/users/stats?from=' + from + '&to=' + to)
  const has = r.json?.signups?.inRange !== undefined
  record('Identity', 'GET', '/admin/users/stats?from=&to=', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200
      ? (has ? 'inRange=' + r.json.signups.inRange + ', byPlanInRange present' : '200 but NO inRange field')
      : msg(r))
}
if (USER) {
  const r = await call('GET', '/admin/users/' + USER.id)
  const extra = ['contentCount', 'emailVerified'].filter((k) => r.json?.[k] !== undefined)
  record('Identity', 'GET', '/admin/users/:id', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? 'detail-only fields: ' + (extra.join(', ') || 'NONE') : msg(r))

  const cur = r.json ?? USER
  const a = await call('PATCH', '/admin/users/' + USER.id + '/active', { body: { isActive: cur.isActive } })
  const back = await call('GET', '/admin/users/' + USER.id)
  record('Identity', 'PATCH', '/admin/users/:id/active', 'noop', a, a.status < 300 ? 'ok' : 'fail',
    a.status < 300
      ? 're-sent isActive=' + cur.isActive + ', read-back ' + back.json?.isActive + ' (unchanged)'
      : msg(a))

  // The API needs { role, action }; the app sends exactly this. Re-granting a
  // role the user already holds is the no-op.
  const role = (cur.roles ?? ['creator'])[0]
  const rr = await call('POST', '/admin/users/' + USER.id + '/roles', { body: { role, action: 'grant' } })
  const back2 = await call('GET', '/admin/users/' + USER.id)
  record('Identity', 'POST', '/admin/users/:id/roles', 'noop', rr, rr.status < 300 ? 'ok' : 'fail',
    rr.status < 300 ? 're-granted "' + role + '", roles now ' + JSON.stringify(back2.json?.roles) : msg(rr))
}
if (USER_NOONBOARD) {
  const r = await call('POST', '/admin/users/' + USER_NOONBOARD.id + '/reset-onboarding')
  const back = await call('GET', '/admin/users/' + USER_NOONBOARD.id)
  record('Identity', 'POST', '/admin/users/:id/reset-onboarding', 'noop', r, r.status < 300 ? 'ok' : 'fail',
    r.status < 300 ? 'target already false, read-back ' + back.json?.onboardingCompleted : msg(r))
} else {
  record('Identity', 'POST', '/admin/users/:id/reset-onboarding', 'blocked', { status: 0, ms: 0 }, 'blocked',
    'no user with onboardingCompleted=false, so firing would change real state')
}

section('content')
let CONTENT = null
const CONTENT_STATES = {}
{
  const r = await call('GET', '/admin/content?limit=100')
  const items = r.json?.items ?? []
  CONTENT = items[0] ?? null
  for (const c of items) CONTENT_STATES[c.status] = (CONTENT_STATES[c.status] ?? 0) + 1
  record('Content', 'GET', '/admin/content', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? items.length + ' rows, ' + JSON.stringify(CONTENT_STATES) : msg(r))
}
// All seven values the 2026-08-29 reference lists. `draft` and `processing` were
// missing from earlier audits and have no tab in the UI.
for (const st of ['draft', 'processing', 'publishing', 'moderation_rejected',
                  'generation_failed', 'published', 'deleted']) {
  const r = await call('GET', '/admin/content?status=' + st + '&limit=100')
  const n = (r.json?.items ?? []).length
  record('Content', 'GET', '/admin/content?status=' + st, 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? n + ' rows' : msg(r))
}
if (CONTENT) {
  const r = await call('GET', '/admin/content/' + CONTENT.id)
  record('Content', 'GET', '/admin/content/:id', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? 'authoritative single-item read' : msg(r))
}
for (const act of ['approve', 'takedown']) {
  const r = await call('POST', '/admin/content/' + GHOST + '/' + act)
  const m = msg(r)
  const routed = (r.status === 404 && /not found/i.test(m) && !/route not found/i.test(m)) || r.status === 400
  record('Content', 'POST', '/admin/content/:id/' + act, 'probe', r, routed ? 'expected' : 'fail',
    'ghost uuid -> "' + m + '" ' + (routed ? '(route exists and validates)' : '(ROUTE MISSING)'))
}
let PLAN_KEY = 'FREE'
{
  const r = await call('GET', '/admin/plans')
  const plans = r.json?.items ?? r.json?.plans ?? r.json
  const arr = Array.isArray(plans) ? plans : []
  if (arr[0]) PLAN_KEY = arr[0].plan ?? arr[0].name ?? arr[0].id ?? 'FREE'
  record('Content', 'GET', '/admin/plans', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? arr.length + ' plans' : msg(r))
}
{
  const r = await call('GET', '/admin/plans/' + PLAN_KEY)
  record('Content', 'GET', '/admin/plans/:plan', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? 'read-back source for PUT (' + PLAN_KEY + ')' : msg(r))
  if (r.status === 200 && r.json) {
    // The PUT DTO forbids 'plan' and 'updatedAt', so a GET response cannot be
    // echoed back verbatim. The app strips them via Omit<PlanLimits,...> too.
    const { plan: _p, updatedAt: _u, ...writable } = r.json
    const p = await call('PUT', '/admin/plans/' + PLAN_KEY, { body: writable })
    const back = await call('GET', '/admin/plans/' + PLAN_KEY)
    const same = JSON.stringify({ ...back.json, updatedAt: null }) === JSON.stringify({ ...r.json, updatedAt: null })
    record('Content', 'PUT', '/admin/plans/:plan', 'noop', p, p.status < 300 ? 'ok' : 'fail',
      p.status < 300 ? 're-sent identical values, read-back ' + (same ? 'identical' : 'CHANGED') : msg(p))
  }
}

section('ai')
let queuesFailed = null
let jobsFailed = null
let JOB_DONE = null
{
  const r = await call('GET', '/admin/queues')
  const qs = r.json?.queues ?? r.json?.items ?? r.json
  const arr = Array.isArray(qs) ? qs : Object.values(qs ?? {}).filter((v) => v && typeof v === 'object')
  queuesFailed = arr.reduce((a, q) => a + (q.failed ?? 0), 0)
  record('AI', 'GET', '/admin/queues', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? 'mode=' + (r.json?.mode ?? '?') + ', summed failed=' + queuesFailed : msg(r))
}
{
  const r = await call('GET', '/admin/jobs?limit=100')
  const items = r.json?.items ?? []
  JOB_DONE = items.find((j) => j.status === 'completed') ?? null
  record('AI', 'GET', '/admin/jobs', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? items.length + ' rows' : msg(r))
}
{
  const r = await call('GET', '/admin/jobs?status=failed&limit=100')
  jobsFailed = (r.json?.items ?? []).length
  record('AI', 'GET', '/admin/jobs?status=failed', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? jobsFailed + ' failed jobs' : msg(r))
}
if (JOB_DONE) {
  // Retrying a genuinely failed job costs real provider spend, so aim at a
  // completed one: a correct refusal proves the handler works end to end.
  const r = await call('POST', '/admin/jobs/' + JOB_DONE.id + '/retry')
  const m = msg(r)
  const rejected = r.status === 400 && /expected failed|status is/i.test(m)
  record('AI', 'POST', '/admin/jobs/:id/retry', 'probe', r, rejected ? 'expected' : r.status < 300 ? 'ok' : 'fail',
    rejected ? 'correctly refused a completed job: "' + m + '"' : m)
} else {
  record('AI', 'POST', '/admin/jobs/:id/retry', 'blocked', { status: 0, ms: 0 }, 'blocked',
    'no completed job available to safely reject against')
}
{
  const r = await call('GET', '/admin/costs/summary')
  record('AI', 'GET', '/admin/costs/summary', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? 'byDay=' + (r.json?.byDay ?? []).length + ' points' : 'BE-1 - ' + msg(r))
}
let CAT = null
let QUESTION = null
let CATS = []
/** Readiness fields the 2026-08-29 reference promises on category responses. */
const READINESS = ['requiredQuestionCount', 'activeQuestionCount', 'isReady', 'missingQuestionNumbers']
{
  const r = await call('GET', '/admin/coach/categories')
  const cats = r.json?.items ?? r.json
  CATS = Array.isArray(cats) ? cats : []
  CAT = CATS[0] ?? null
  const ready = READINESS.filter((k) => CAT?.[k] !== undefined)
  record('AI', 'GET', '/admin/coach/categories', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200
      ? CATS.length + ' categories, readiness fields: ' + (ready.join(', ') || 'ABSENT')
      : msg(r))
}
{
  const r = await call('GET', '/admin/coach/categories?activeOnly=true')
  const arr = r.json?.items ?? r.json
  record('AI', 'GET', '/admin/coach/categories?activeOnly=', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? (Array.isArray(arr) ? arr.length : '?') + ' active of ' + CATS.length : msg(r))
}
{
  // An empty body makes the server enumerate its own validation rules.
  const r = await call('POST', '/admin/coach/categories', { body: {} })
  record('AI', 'POST', '/admin/coach/categories', 'probe', r, r.status === 400 ? 'expected' : 'fail',
    r.status === 400 ? 'validation: "' + msg(r) + '"' : msg(r))
}
{
  // The slug rule moved once already (lowercase-kebab -> alphanumeric) and the
  // FE mirrors it client-side, so track exactly which shapes are accepted.
  // Slug-only bodies always fail on the other required fields, so nothing is created.
  const shapes = { gaming: null, Gaming: null, UPPER_SNAKE: null, 'has space': null }
  for (const slug of Object.keys(shapes)) {
    const r = await call('POST', '/admin/coach/categories', { body: { slug } })
    shapes[slug] = /slug/i.test(msg(r)) ? 'rejected' : 'accepted'
  }
  const accepted = Object.entries(shapes).filter(([, v]) => v === 'accepted').map(([k]) => k)
  record('AI', 'POST', '/admin/coach/categories (slug rule)', 'probe', { status: 200, ms: 0 }, 'expected',
    'accepted: ' + (accepted.join(', ') || 'none') +
    '  |  rejected: ' + Object.entries(shapes).filter(([, v]) => v === 'rejected').map(([k]) => k).join(', '))
}
if (CAT) {
  const r = await call('PATCH', '/admin/coach/categories/' + CAT.id, { body: { isActive: CAT.isActive } })
  record('AI', 'PATCH', '/admin/coach/categories/:id', 'noop', r, r.status < 300 ? 'ok' : 'fail',
    r.status < 300 ? 're-sent isActive=' + CAT.isActive : msg(r))

  const d = await call('GET', '/admin/coach/categories/' + CAT.id)
  const embedded = Array.isArray(d.json?.questions) ? d.json.questions.length + ' embedded questions' : 'no embedded questions'
  record('AI', 'GET', '/admin/coach/categories/:id', 'read', d, d.status === 200 ? 'ok' : 'fail',
    d.status === 200 ? embedded : msg(d))

  const q = await call('GET', '/admin/coach/categories/' + CAT.id + '/questions')
  const qs = q.json?.items ?? q.json
  const qarr = Array.isArray(qs) ? qs : []
  QUESTION = qarr[0] ?? null
  record('AI', 'GET', '/admin/coach/categories/:id/questions', 'read', q, q.status === 200 ? 'ok' : 'fail',
    q.status === 200 ? qarr.length + ' questions' : msg(q))

  const qi = await call('GET', '/admin/coach/categories/' + CAT.id + '/questions?includeInactive=true')
  const qiArr = qi.json?.items ?? qi.json
  record('AI', 'GET', '/admin/coach/categories/:id/questions?includeInactive=', 'read', qi,
    qi.status === 200 ? 'ok' : 'fail',
    qi.status === 200 ? (Array.isArray(qiArr) ? qiArr.length : '?') + ' incl. inactive (vs ' + qarr.length + ' active)' : msg(qi))

  const qp = await call('POST', '/admin/coach/categories/' + CAT.id + '/questions', { body: {} })
  record('AI', 'POST', '/admin/coach/categories/:id/questions', 'probe', qp, qp.status === 400 ? 'expected' : 'fail',
    qp.status === 400 ? 'validation: "' + msg(qp) + '"' : msg(qp))

  // Bulk upsert can deactivate every row absent from the payload, so only its
  // validation is exercised — never a real payload.
  const bulk = await call('PUT', '/admin/coach/categories/' + CAT.id + '/questions', { body: {} })
  record('AI', 'PUT', '/admin/coach/categories/:id/questions', 'probe', bulk,
    bulk.status === 400 ? 'expected' : 'fail',
    bulk.status === 400 ? 'validation: "' + msg(bulk) + '"' : msg(bulk))
}
if (CATS.length) {
  // Reorder mutates sortOrder, so re-send the order that already exists.
  const items = CATS.map((c) => ({ id: c.id, sortOrder: c.sortOrder })).filter((x) => x.sortOrder !== undefined)
  const r = await call('PATCH', '/admin/coach/categories/reorder', { body: { items } })
  record('AI', 'PATCH', '/admin/coach/categories/reorder', 'noop', r, r.status < 300 ? 'ok' : 'fail',
    r.status < 300 ? 're-sent existing order for ' + items.length + ' categories (unchanged)' : msg(r))
}
if (QUESTION) {
  const r = await call('PATCH', '/admin/coach/questions/' + QUESTION.id, { body: { isActive: QUESTION.isActive } })
  record('AI', 'PATCH', '/admin/coach/questions/:id', 'noop', r, r.status < 300 ? 'ok' : 'fail',
    r.status < 300 ? 're-sent isActive=' + QUESTION.isActive : msg(r))

  const one = await call('GET', '/admin/coach/questions/' + QUESTION.id)
  const hasParent = one.json?.category !== undefined
  record('AI', 'GET', '/admin/coach/questions/:id', 'read', one, one.status === 200 ? 'ok' : 'fail',
    one.status === 200 ? 'parent category embedded: ' + hasParent : msg(one))
}

section('feed - gateway - media')
{
  const r = await call('GET', '/admin/explore?limit=50')
  record('Feed', 'GET', '/admin/explore', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? (r.json?.items ?? []).length + ' rows' : msg(r))
}
{
  const r = await call('GET', '/admin/explore?limit=50&sort=wes')
  record('Feed', 'GET', '/admin/explore?sort=', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? 'server-side sort accepted' : 'BE-8 - ' + msg(r))
}
{
  const r = await call('GET', '/admin/health')
  const svc = r.json?.services ?? r.json ?? {}
  const entries = Object.entries(svc).filter(([, v]) => v && typeof v === 'object')
  const down = entries.filter(([, v]) => v.status && v.status !== 'up').map(([k]) => k)
  record('Gateway', 'GET', '/admin/health', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? entries.length + ' services, down: ' + (down.join(', ') || 'none') : msg(r))
}
if (CONTENT) {
  const r = await call('GET', '/content/' + CONTENT.id + '/media')
  record('Media', 'GET', '/content/:id/media', 'read', r, r.status === 200 ? 'ok' : 'fail',
    r.status === 200 ? 'media reachable' : 'BE-10 - ' + msg(r))
}

section('constraints - non-routes')
{
  const r = await call('GET', '/admin/content?limit=200')
  record('Constraint', 'GET', '/admin/content?limit=200', 'read', r, r.status === 400 ? 'expected' : 'fail',
    r.status === 400 ? 'cap still enforced: "' + msg(r) + '"' : 'cap NOT enforced (' + r.status + ')')
}
const NONROUTES = [
  ['GET', '/admin/content/queue-count', 'collides with /admin/content/:id'],
  ['GET', '/admin/publishing', 'use /admin/content?status=publishing'],
  ['DELETE', '/admin/coach/categories/' + GHOST, 'no DELETE route, so created categories are permanent'],
]
for (const [m, path, label] of NONROUTES) {
  const r = await call(m, path)
  record('Non-route', m, path.replace(GHOST, ':id'), 'probe', r, 'absent', r.status + ' - ' + label)
}

section('auth (destructive, run last)')
{
  // Logout revokes the refresh token, so it has to be the final probe.
  const r = await call('POST', '/auth/logout')
  const after = await call('POST', '/auth/refresh', { body: { refreshToken: REFRESH }, token: null })
  record('Auth', 'POST', '/auth/logout', 'noop', r, r.status < 300 ? 'ok' : 'fail',
    r.status < 300 ? 'refresh token revoked (subsequent /auth/refresh -> ' + after.status + ')' : msg(r))
}

const n = (v) => rows.filter((x) => x.verdict === v).length
console.log('\n' + '-'.repeat(72))
console.log('  probed ' + rows.length + '   ok ' + n('ok') + '   expected-rejection ' + n('expected') +
  '   FAILING ' + n('fail') + '   blocked ' + n('blocked') + '   absent-by-design ' + n('absent'))
if (queuesFailed !== null && jobsFailed !== null) {
  console.log('  BE-9: /admin/queues failed=' + queuesFailed + ' vs /admin/jobs?status=failed=' + jobsFailed +
    ' -> ' + (queuesFailed === jobsFailed ? 'AGREE' : 'DISAGREE'))
}
console.log('  live content states: ' + JSON.stringify(CONTENT_STATES))
console.log('\n  FAILING:')
for (const r of rows.filter((x) => x.verdict === 'fail')) {
  console.log('    x ' + r.method + ' ' + r.path + ' -> ' + r.status + ' - ' + r.note)
}
console.log('\n  BLOCKED (no safe production target):')
for (const r of rows.filter((x) => x.verdict === 'blocked')) {
  console.log('    - ' + r.method + ' ' + r.path + ' - ' + r.note)
}
if (process.env.NX_AUDIT_JSON) {
  const { writeFileSync } = await import('node:fs')
  writeFileSync(process.env.NX_AUDIT_JSON, JSON.stringify(rows, null, 2))
  console.log('\n  wrote ' + process.env.NX_AUDIT_JSON)
}
