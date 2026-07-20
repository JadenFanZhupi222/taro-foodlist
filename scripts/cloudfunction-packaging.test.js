const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { builtinModules } = require('node:module')

const root = path.join(__dirname, '..')
const workflow = fs.readFileSync(
  path.join(root, '.github', 'workflows', 'database-hardening-rollout.yml'),
  'utf8'
)

function rolloutFunctions() {
  const match = workflow.match(/^\s*functions="([^"]+)"/m)
  assert.ok(match, 'rollout function list is missing')
  return match[1].trim().split(/\s+/)
}

function packageName(specifier) {
  if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/')
  return specifier.split('/')[0]
}

test('every rollout function declares each imported runtime package', () => {
  const builtins = new Set(builtinModules.flatMap(name => [name, `node:${name}`]))
  const missing = []

  for (const functionName of rolloutFunctions()) {
    const directory = path.join(root, 'cloudfunctions', functionName)
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'))
    const source = fs.readFileSync(path.join(directory, manifest.main || 'index.js'), 'utf8')
    const dependencies = manifest.dependencies || {}
    const imports = [...source.matchAll(/require\(['"]([^'"]+)['"]\)/g)]
      .map(match => match[1])
      .filter(specifier => !specifier.startsWith('.') && !builtins.has(specifier))
      .map(packageName)

    for (const dependency of new Set(imports)) {
      if (!dependencies[dependency]) missing.push(`${functionName}: ${dependency}`)
    }
  }

  assert.deepEqual(missing, [])
})
