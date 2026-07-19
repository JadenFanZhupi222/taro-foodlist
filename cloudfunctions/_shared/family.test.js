const test = require('node:test')
const assert = require('node:assert/strict')
const {
  resolveCurrentFamily,
  nextFamilyOwner,
  makeRelationKey
} = require('./family')

test('returns null when the user has no family', () => {
  assert.equal(resolveCurrentFamily([], 'target'), null)
})

test('returns the target family when already joined', () => {
  assert.deepEqual(resolveCurrentFamily([{ _id: 'target' }], 'target'), { _id: 'target' })
})

test('rejects joining a different family', () => {
  assert.throws(
    () => resolveCurrentFamily([{ _id: 'other' }], 'target'),
    error => error.code === 'FAMILY_CONFLICT'
  )
})

test('rejects an already-corrupt multi-family membership', () => {
  assert.throws(
    () => resolveCurrentFamily([{ _id: 'one' }, { _id: 'two' }], 'one'),
    error => error.code === 'MULTIPLE_FAMILIES'
  )
})

test('selects the next member as owner', () => {
  assert.equal(nextFamilyOwner(['u1', 'u2'], 'u1'), 'u2')
  assert.equal(nextFamilyOwner(['u1'], 'u1'), null)
})

test('builds a stable recipe relation key', () => {
  assert.equal(makeRelationKey('f/1', 'r/2'), 'f%2F1_r%2F2')
})
