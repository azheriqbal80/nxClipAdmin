import test from 'node:test'
import assert from 'node:assert/strict'
import { chartUsers, creatorInfo, dateTime, encodeCsv, loadModerationSnapshot, overviewCsv, queryState, recordTitle } from '../src/features/overview/api/presentation.ts'

const content = (id, status, createdAt = '2026-09-01T00:00:00Z') => ({ id, status, createdAt, userId: 'creator-123456', title: null, prompt: null })

test('a failed moderation status cannot become a zero or partial successful count', async () => {
  const requested = []
  await assert.rejects(loadModerationSnapshot(async status => {
    requested.push(status)
    if (status === 'moderation_rejected') throw new Error('unavailable')
    return { items: [] }
  }), /unavailable/)
  assert.deepEqual(requested.sort(), ['generation_failed', 'moderation_rejected', 'publishing'])
})

test('moderation counts and records share a deduplicated, dated snapshot with cap disclosure', async () => {
  const publishing = content('first', 'publishing')
  const result = await loadModerationSnapshot(async status => status === 'publishing'
    ? { items: [publishing], nextCursor: 'next-page' }
    : status === 'moderation_rejected' ? { items: [content('latest', status, '2026-09-10T00:00:00Z'), publishing] }
      : { items: [content('undated', status, null)] })
  assert.equal(result.count, 3)
  assert.equal(result.capped, true)
  assert.equal(result.publishingCapped, true)
  assert.equal(result.publishing, 1)
  assert.deepEqual(result.items.map(item => item.id), ['latest', 'first', 'undated'])
})

test('an empty successful moderation response really is clear', async () => {
  const result = await loadModerationSnapshot(async () => ({ items: [], nextCursor: null }))
  assert.equal(result.count, 0)
  assert.equal(result.capped, false)
})

test('chart windows follow the current snapshot and reject invalid/future timestamps', () => {
  const now = Date.parse('2026-09-11T12:00:00Z')
  const user = (id, ageDays) => ({ id, plan: 'FREE', createdAt: new Date(now - ageDays * 86_400_000).toISOString() })
  const users = [user('today', 0), user('seven', 7), user('eight', 8), user('thirty', 30), user('old', 31), user('future', -1), { id: 'invalid', plan: 'FREE', createdAt: 'invalid' }]
  assert.deepEqual(chartUsers(users, '7d', now).map(item => item.id), ['today', 'seven'])
  assert.deepEqual(chartUsers(users, '30d', now).map(item => item.id), ['today', 'seven', 'eight', 'thirty'])
  assert.equal(chartUsers(users, 'all', now).length, 5)
})

test('missing creator identity and record dates use truthful fallbacks', () => {
  assert.deepEqual(creatorInfo('creator-123456', []), { name: 'creator-', handle: 'ID · creator-' })
  assert.deepEqual(creatorInfo('c1', [{ id: 'c1', displayName: ' Maya ', username: 'maya', plan: 'PRO', createdAt: '' }]), { name: 'Maya', handle: '@maya' })
  assert.equal(recordTitle({ title: ' ', prompt: '  Available prompt  ' }), 'Available prompt')
  assert.equal(recordTitle({ title: null, prompt: null }), 'Untitled content')
  assert.equal(dateTime(null), 'Unavailable')
  assert.equal(dateTime('not-a-date'), 'Unavailable')
})

test('failed query states stay distinct from loading and successful zero values', () => {
  assert.equal(queryState({ isPending: false, isError: true }), 'unavailable')
  assert.equal(queryState({ isPending: true, isError: false }), 'loading')
  assert.equal(queryState({ isPending: false, isError: false }), 'ready')
})

test('CSV protects untrusted content from formulas and preserves quoted multiline text', () => {
  const csv = encodeCsv([['=HYPERLINK("bad")', ' +SUM(1,2)', '@SUM(1)', 'title,"quoted"\nsecond line']])
  assert.match(csv, /"'=HYPERLINK\(""bad""\)"/)
  assert.match(csv, /"' \+SUM\(1,2\)"/)
  assert.match(csv, /"'@SUM\(1\)"/)
  assert.ok(csv.includes('"title,""quoted""\nsecond line"'))
})

test('report exports capped counts and unavailable values rather than replacing them with zero', () => {
  const csv = overviewCsv({ capturedAt: Date.parse('2026-09-11T12:00:00Z'), moderation: { count: 150, capped: true }, failed: { count: 0, capped: false } }, [content('c1', 'publishing')], true)
  assert.ok(csv.includes('"In moderation (loaded statuses)","150+"'))
  assert.ok(csv.includes('"Failed jobs","0"'))
  assert.ok(csv.includes('"Spend 30d (USD)","Unavailable"'))
  assert.ok(csv.includes('"Total users","Unavailable"'))
  assert.ok(csv.includes('"c1","Untitled content","creator-123456","creator-","publishing"'))
})
