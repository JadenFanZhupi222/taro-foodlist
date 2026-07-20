const cloudbase = require('@cloudbase/node-sdk')
const CloudBase = require('@cloudbase/manager-node')

const LOCK_COLLECTIONS = ['family_members', 'daily_menu_keys']

async function main() {
  const envId = process.env.CLOUDBASE_ENV_ID
  const secretId = process.env.TC_SECRET_ID
  const secretKey = process.env.TC_SECRET_KEY
  if (!envId || !secretId || !secretKey) throw new Error('CloudBase credentials are missing')
  const runId = String(process.env.GITHUB_RUN_ID || Date.now()).replace(/\D/g, '').slice(-12)
  const attempt = String(process.env.GITHUB_RUN_ATTEMPT || '1').replace(/\D/g, '').slice(-2)
  const smokeCollection = `db_smoke_${runId}_${attempt}`

  const manager = CloudBase.init({ envId, secretId, secretKey })
  for (const name of LOCK_COLLECTIONS) {
    await manager.database.createCollectionIfNotExists(name)
  }
  let smokeCollectionCreated = false

  try {
    await manager.database.createCollection(smokeCollection)
    smokeCollectionCreated = true
    const app = cloudbase.init({ env: envId, secretId, secretKey })
    const db = app.database()
    const stamp = `${Date.now()}_${Math.random().toString(16).slice(2)}`
    const docId = `smoke_${stamp}`
    let transaction = await db.startTransaction()
    try {
      const added = await transaction.collection(smokeCollection).add({ kind: 'add', stamp })
      const addedId = added.id || added._id
      await transaction.collection(smokeCollection).doc(docId).set({ kind: 'set', stamp })
      const readBack = await transaction.collection(smokeCollection).doc(docId).get()
      const data = Array.isArray(readBack.data) ? readBack.data[0] : readBack.data
      if (!data || data.stamp !== stamp) throw new Error('transaction get/set verification failed')
      await transaction.collection(smokeCollection).doc(docId).update({ kind: 'updated' })
      await transaction.collection(smokeCollection).doc(addedId).delete()
      await transaction.commit()
      transaction = null
    } finally {
      if (transaction) await transaction.rollback().catch(() => {})
    }

    const cleanup = await db.startTransaction()
    try {
      await cleanup.collection(smokeCollection).doc(docId).delete()
      await cleanup.commit()
    } catch (error) {
      await cleanup.rollback().catch(() => {})
      throw error
    }
    console.log('CloudBase transaction smoke test passed')
  } finally {
    if (smokeCollectionCreated) await manager.database.deleteCollection(smokeCollection)
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
