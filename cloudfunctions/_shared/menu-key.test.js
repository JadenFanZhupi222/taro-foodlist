const test = require('node:test')
const assert = require('node:assert/strict')
const { normalizeDateKey, makeMenuKey } = require('./menu-key')

test('normalizes an ISO timestamp to a Shanghai date key', () => {
  assert.equal(normalizeDateKey('2026-07-20T18:00:00.000Z'), '2026-07-21')
})

test('keeps an existing YYYY-MM-DD key unchanged', () => {
  assert.equal(normalizeDateKey('2026-07-20'), '2026-07-20')
})

test('builds a stable menu key', () => {
  assert.equal(makeMenuKey('family/a', '2026-07-20'), 'family%2Fa_2026-07-20')
})
