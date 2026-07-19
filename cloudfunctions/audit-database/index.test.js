const test = require('node:test')
const assert = require('node:assert/strict')
const {
  auditFamilies,
  auditUsers,
  auditRecipeRelations,
  auditMenus
} = require('./audit')

test('reports users that appear in more than one family', () => {
  const result = auditFamilies([
    { _id: 'f1', members: ['u1', 'u2'] },
    { _id: 'f2', members: ['u2'] }
  ])

  assert.equal(result.count, 1)
  assert.deepEqual(result.multiFamilyUsers, [
    { openId: 'u2', familyIds: ['f1', 'f2'] }
  ])
})

test('reports cached family ids that disagree with family membership', () => {
  const result = auditUsers(
    [{ _id: 'user1', openId: 'u1', family_id: 'f2' }],
    [{ _id: 'f1', members: ['u1'] }]
  )

  assert.deepEqual(result.familyCacheMismatches, [
    { openId: 'u1', cachedFamilyId: 'f2', actualFamilyIds: ['f1'] }
  ])
})

test('reports duplicate and orphan recipe relations', () => {
  const result = auditRecipeRelations(
    [
      { _id: 'x1', family_id: 'f1', recipe_id: 'r1' },
      { _id: 'x2', family_id: 'f1', recipe_id: 'r1' },
      { _id: 'x3', family_id: 'missing', recipe_id: 'r2' }
    ],
    [{ _id: 'r1' }],
    [{ _id: 'f1' }]
  )

  assert.deepEqual(result.duplicateRelations, [
    { relationKey: 'f1_r1', relationIds: ['x1', 'x2'] }
  ])
  assert.deepEqual(result.orphanRelations, [
    { relationId: 'x3', familyId: 'missing', recipeId: 'r2', missing: ['family', 'recipe'] }
  ])
})

test('reports duplicate menus and unknown families', () => {
  const result = auditMenus(
    [
      { _id: 'm1', family_id: 'f1', date: '2026-07-20' },
      { _id: 'm2', family_id: 'f1', date: '2026-07-20' },
      { _id: 'm3', family_id: 'missing', date: '2026-07-21' }
    ],
    [{ _id: 'f1' }]
  )

  assert.deepEqual(result.duplicateMenus, [
    { menuKey: 'f1_2026-07-20', menuIds: ['m1', 'm2'] }
  ])
  assert.deepEqual(result.orphanMenus, [
    { menuId: 'm3', familyId: 'missing', date: '2026-07-21' }
  ])
})
