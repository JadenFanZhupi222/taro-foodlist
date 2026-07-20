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
  assert.match(workflow, /github\.ref/)
  assert.match(workflow, /refs\/heads\/master/)
})

test('production rollout uses the protected production environment', () => {
  assert.match(workflow, /preflight-and-rollout:\s*\n[\s\S]*?environment:\s*production/)
  assert.match(workflow, /github\.sha/)
  assert.match(workflow, /CLOUDBASE_ENV_ID/)
  assert.match(workflow, /ROLLBACK_SHA/)
})

test('production rollout explicitly deletes retired cloud functions', () => {
  assert.match(workflow, /run:\s*node scripts\/delete-retired-functions\.js/)
  assert.doesNotMatch(workflow, /fn list[^\n]*--json/)
  assert.match(workflow, /TC_SECRET_ID:\s*\$\{\{ secrets\.TENCENT_SECRET_ID \}\}/)
  assert.match(workflow, /TC_SECRET_KEY:\s*\$\{\{ secrets\.TENCENT_SECRET_KEY \}\}/)
})

test('production rollout grants the GitHub token read-only contents access', () => {
  assert.match(workflow, /^permissions:\s*\n\s+contents:\s*read/m)
})
