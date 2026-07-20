const test = require('node:test')
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const { readFileSync } = require('node:fs')
const path = require('node:path')

const {
  guestRecipes,
  getVisibleRecipes,
  findVisibleRecipe
} = require('../src/data/guestRecipes')

test('app startup does not interrupt guests with login guidance', () => {
  const appContainer = readFileSync(
    path.resolve(__dirname, '../src/AppContainer.tsx'),
    'utf8'
  )

  assert.doesNotMatch(appContainer, /\b(?:Taro\.)?showModal\s*\(/)
  assert.doesNotMatch(
    appContainer,
    /\b(?:Taro\.)?switchTab\s*\(\s*\{[^}]*\/pages\/profile\/index/s
  )
})

test('guest recipes provide complete read-only browsing fixtures', () => {
  assert.ok(guestRecipes.length >= 2)

  for (const recipe of guestRecipes) {
    assert.match(recipe._id, /^guest:/)
    assert.ok(recipe.name)
    assert.ok(recipe.type)
    assert.ok(recipe.description)
    assert.ok(recipe.ingredients.length > 0)
    assert.ok(recipe.ingredients.every(ingredient => ingredient.name && ingredient.amount))
    assert.ok(recipe.steps.length > 0)
    assert.ok(recipe.steps.every(Boolean))
    assert.equal(recipe.deleted, false)
  }
})

test('guests receive fixtures while signed-in users receive only real recipes', () => {
  const realRecipes = [
    { _id: 'recipe:family-1', name: '家常菜', type: '大荤', deleted: false }
  ]

  assert.deepEqual(getVisibleRecipes(realRecipes, false), guestRecipes)
  assert.deepEqual(getVisibleRecipes(realRecipes, true), realRecipes)
})

test('recipe lookup respects login state', () => {
  const realRecipe = { _id: 'recipe:family-1', name: '家常菜', type: '大荤', deleted: false }
  const guestRecipe = guestRecipes[0]

  assert.equal(findVisibleRecipe([realRecipe], guestRecipe._id, false), guestRecipe)
  assert.equal(findVisibleRecipe([realRecipe], realRecipe._id, false), undefined)
  assert.equal(findVisibleRecipe([realRecipe], realRecipe._id, true), realRecipe)
  assert.equal(findVisibleRecipe([realRecipe], guestRecipe._id, true), undefined)
})

test('guest recipe helpers remain compatible with JavaScript type checking', () => {
  const result = spawnSync('pnpm', [
    'exec',
    'tsc',
    '--allowJs',
    '--checkJs',
    '--noEmit',
    '--target',
    'es2017',
    '--module',
    'commonjs',
    '--skipLibCheck',
    'src/data/guestRecipes.js'
  ], {
    cwd: require('node:path').resolve(__dirname, '..'),
    encoding: 'utf8',
    shell: true
  })

  assert.equal(result.status, 0, result.stdout + result.stderr + (result.error || ''))
})
