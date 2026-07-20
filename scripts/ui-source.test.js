const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')

const root = path.resolve(__dirname, '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

const informationalPages = [
  'src/pages/favorites/index.tsx',
  'src/pages/history/index.tsx',
  'src/pages/settings/notification/index.tsx',
  'src/pages/settings/privacy/index.tsx',
  'src/pages/settings/about/index.tsx'
]

test('informational pages no longer use the generic ComingSoon component', () => {
  for (const file of informationalPages) {
    assert.doesNotMatch(read(file), /ComingSoon/, file)
  }
})

test('components using useState import it from React', () => {
  const files = []
  const walk = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) walk(absolute)
      else if (/\.tsx$/.test(entry.name)) files.push(absolute)
    }
  }
  walk(path.join(root, 'src'))
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8')
    if (!/\buseState\s*\(/.test(source)) continue
    assert.match(source, /from ['"]react['"]/, path.relative(root, file))
    assert.doesNotMatch(source, /import[^\n]*\buseState\b[^\n]*from ['"]@tarojs\/taro['"]/, path.relative(root, file))
  }
})

test('source modules do not use local runtime requires that Taro leaves unresolved', () => {
  const files = []
  const walk = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) walk(absolute)
      else if (/\.[jt]sx?$/.test(entry.name)) files.push(absolute)
    }
  }
  walk(path.join(root, 'src'))
  for (const file of files) {
    assert.doesNotMatch(
      fs.readFileSync(file, 'utf8'),
      /\brequire\(\s*['"](?:@\/|\.\.?\/)/,
      path.relative(root, file)
    )
  }
})

test('local JavaScript helpers expose only ESM exports to the Taro module graph', () => {
  const files = []
  const walk = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) walk(absolute)
      else if (/\.js$/.test(entry.name)) files.push(absolute)
    }
  }
  walk(path.join(root, 'src'))
  for (const file of files) {
    assert.doesNotMatch(
      fs.readFileSync(file, 'utf8'),
      /\b(?:module\.exports(?:\.[A-Za-z_$][\w$]*)?|exports\.[A-Za-z_$][\w$]*)\s*=/,
      path.relative(root, file)
    )
  }
})

test('WeChat styles keep full motion without unsupported reduced-motion blocks', () => {
  const styles = []
  const walk = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) walk(absolute)
      else if (/\.scss$/.test(entry.name)) styles.push(absolute)
    }
  }
  walk(path.join(root, 'src'))
  for (const file of styles) {
    assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /prefers-reduced-motion/, path.relative(root, file))
  }
})
