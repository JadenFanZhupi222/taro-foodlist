const cloud = require('@cloudbase/node-sdk')
const {
  auditFamilies,
  auditUsers,
  auditRecipeRelations,
  auditMenus
} = require('./audit')

const PAGE_SIZE = 100
const SAMPLE_SIZE = 100

async function readAll(db, collectionName) {
  const rows = []
  let offset = 0

  while (true) {
    const result = await db.collection(collectionName)
      .skip(offset)
      .limit(PAGE_SIZE)
      .get()
    const batch = result.data || []
    rows.push(...batch)
    if (batch.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return rows
}

function sampleReport(report) {
  return Object.fromEntries(Object.entries(report).map(([key, value]) => [
    key,
    Array.isArray(value) ? value.slice(0, SAMPLE_SIZE) : value
  ]))
}

exports.main = async event => {
  const configuredToken = process.env.DATABASE_AUDIT_TOKEN
  if (!configuredToken || event.auditToken !== configuredToken) {
    return { code: 403, message: '无权执行数据库审计' }
  }

  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
  const db = app.database()

  try {
    const [users, families, recipes, relations, menus] = await Promise.all([
      readAll(db, 'user'),
      readAll(db, 'family'),
      readAll(db, 'recipes'),
      readAll(db, 'family_recipes'),
      readAll(db, 'daily_menu')
    ])

    return {
      code: 0,
      message: '数据库审计完成',
      data: {
        generatedAt: new Date().toISOString(),
        totals: {
          users: users.length,
          families: families.length,
          recipes: recipes.length,
          recipeRelations: relations.length,
          dailyMenus: menus.length
        },
        families: sampleReport(auditFamilies(families)),
        users: sampleReport(auditUsers(users, families)),
        recipeRelations: sampleReport(auditRecipeRelations(relations, recipes, families)),
        menus: sampleReport(auditMenus(menus, families))
      }
    }
  } catch (error) {
    console.error('数据库审计失败', error)
    return { code: 500, message: '数据库审计失败', error: error.message }
  }
}

exports.readAll = readAll
