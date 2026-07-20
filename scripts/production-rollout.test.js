const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const workflow = fs.readFileSync(
  path.join(__dirname, '..', '.github', 'workflows', 'database-hardening-rollout.yml'),
  'utf8'
)

test('production rollout is manual and requires an exact confirmation', () => {
  assert.match(workflow, /^on:\s*\n\s+workflow_dispatch:/m)
  assert.doesNotMatch(workflow, /^\s+push:/m)
  assert.match(workflow, /confirmation:\s*\n[\s\S]*?required:\s*true/)
  assert.match(workflow, /CONFIRMATION["']?\s*!=\s*'DEPLOY'/)
})

test('production rollout uses the protected production environment', () => {
  assert.match(workflow, /preflight-and-rollout:\s*\n[\s\S]*?environment:\s*production/)
  assert.match(workflow, /github\.sha/)
  assert.match(workflow, /CLOUDBASE_ENV_ID/)
  assert.match(workflow, /ROLLBACK_SHA/)
})

test('production rollout explicitly deletes retired cloud functions', () => {
  for (const functionName of ['get-user-info', 'reorder-daily-menu']) {
    assert.match(
      workflow,
      new RegExp(`fn delete ["']?${functionName}["']?.*--force`),
      `missing forced deletion for ${functionName}`
    )
  }
})
