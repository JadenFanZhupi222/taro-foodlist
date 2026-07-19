const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const cloudbase = require('@cloudbase/node-sdk')
const {
  auditFamilies,
  auditUsers,
  auditRecipeRelations,
  auditMenus
} = require('../cloudfunctions/audit-database/audit')

const PAGE_SIZE = 100
const COLLECTIONS = ['user', 'family', 'recipes', 'family_recipes', 'daily_menu']

async function readAll(db, name) {
  const rows = []
  let lastId = ''
  while (true) {
    let query = db.collection(name)
    if (lastId) query = query.where({ _id: db.command.gt(lastId) })
    const result = await query.orderBy('_id', 'asc').limit(PAGE_SIZE).get()
    const batch = result.data || []
    rows.push(...batch)
    if (batch.length < PAGE_SIZE) return rows
    lastId = batch[batch.length - 1]._id
  }
}

async function main() {
  const env = process.env.CLOUDBASE_ENV_ID
  const secretId = process.env.TC_SECRET_ID
  const secretKey = process.env.TC_SECRET_KEY
  if (!env || !secretId || !secretKey) throw new Error('CloudBase credentials are missing')

  const app = cloudbase.init({ env, secretId, secretKey })
  const db = app.database()
  const outputDir = path.resolve(process.env.PREFLIGHT_OUTPUT_DIR || 'database-preflight-output')
  fs.mkdirSync(outputDir, { recursive: true })

  const data = {}
  const manifest = {
    startedAt: new Date().toISOString(),
    environment: env,
    snapshotGuarantee: 'two consecutive stable reads; not a database-native snapshot',
    collections: {}
  }
  for (const name of COLLECTIONS) {
    const countBefore = (await db.collection(name).count()).total
    const firstRead = await readAll(db, name)
    const firstJson = JSON.stringify(firstRead, null, 2)
    const firstHash = crypto.createHash('sha256').update(firstJson).digest('hex')
    data[name] = await readAll(db, name)
    const json = JSON.stringify(data[name], null, 2)
    const secondHash = crypto.createHash('sha256').update(json).digest('hex')
    const countAfter = (await db.collection(name).count()).total
    if (countBefore !== countAfter || countAfter !== data[name].length || firstHash !== secondHash) {
      throw new Error(`${name} changed during backup or count mismatch: ${countBefore}/${data[name].length}/${countAfter}`)
    }
    fs.writeFileSync(path.join(outputDir, `${name}.json`), json)
    manifest.collections[name] = {
      count: data[name].length,
      sha256: secondHash
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    environment: env,
    totals: Object.fromEntries(COLLECTIONS.map(name => [name, data[name].length])),
    families: auditFamilies(data.family),
    users: auditUsers(data.user, data.family),
    recipeRelations: auditRecipeRelations(data.family_recipes, data.recipes, data.family),
    menus: auditMenus(data.daily_menu, data.family)
  }
  fs.writeFileSync(path.join(outputDir, 'audit-report.json'), JSON.stringify(report, null, 2))
  manifest.completedAt = new Date().toISOString()
  manifest.complete = true
  fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2))

  const blocking = report.families.count + report.recipeRelations.count + report.menus.count
  console.log(JSON.stringify({
    totals: report.totals,
    blockingConflicts: blocking,
    nonBlockingUserCacheWarnings: report.users.count
  }, null, 2))
  if (blocking > 0) throw new Error(`Database audit found ${blocking} blocking conflict group(s)`)
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
