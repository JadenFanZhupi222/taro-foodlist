const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const workflow = fs.readFileSync(
  path.join(__dirname, '..', '.github', 'workflows', 'deploy.yml'),
  'utf8'
)

test('cloud function deployment filters helper directories from every target list', () => {
  assert.match(workflow, /is_deployable\(\)/)
  assert.match(workflow, /_\*\)\s*return 1/)
  assert.match(workflow, /cloudfunctions\/\$1\/index\.js/)
  assert.match(workflow, /cloudfunctions\/\$1\/package\.json/)
  assert.match(workflow, /targets="\$\(for name in \$targets; do if is_deployable "\$name"; then echo "\$name"; fi; done\)"/)
})
