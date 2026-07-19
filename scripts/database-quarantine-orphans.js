const cloudbase = require('@cloudbase/node-sdk')

const PAGE_SIZE = 100

function first(result) {
  return result && Array.isArray(result.data) ? result.data[0] : null
}

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
  const [families, recipes, relations] = await Promise.all([
    readAll(db, 'family'),
    readAll(db, 'recipes'),
    readAll(db, 'family_recipes')
  ])
  const familyIds = new Set(families.map(item => item._id))
  const recipeIds = new Set(recipes.map(item => item._id))
  const orphans = relations.filter(item => item.deleted !== true &&
    (!familyIds.has(item.family_id) || !recipeIds.has(item.recipe_id)))

  let quarantined = 0
  let skipped = 0
  for (const candidate of orphans) {
    let transaction = await db.startTransaction()
    try {
      const relation = first(await transaction.collection('family_recipes').doc(candidate._id).get())
      if (!relation || relation.deleted === true) {
        await transaction.rollback()
        transaction = null
        skipped += 1
        continue
      }

      const family = first(await transaction.collection('family').doc(relation.family_id).get())
      const recipe = first(await transaction.collection('recipes').doc(relation.recipe_id).get())
      const missing = [!family ? 'family' : null, !recipe ? 'recipe' : null].filter(Boolean)
      if (missing.length === 0) {
        await transaction.rollback()
        transaction = null
        skipped += 1
        continue
      }

      await transaction.collection('family_recipes').doc(relation._id).update({
        deleted: true,
        quarantineReason: `orphan:${missing.join('+')}`,
        quarantinedAt: db.serverDate(),
        updatedAt: db.serverDate()
      })
      await transaction.commit()
      transaction = null
      quarantined += 1
    } catch (error) {
      if (transaction) await transaction.rollback().catch(() => {})
      throw error
    }
  }
  console.log(`Quarantined ${quarantined} active orphan relation(s) by soft deletion; skipped ${skipped} after transaction revalidation`)
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
