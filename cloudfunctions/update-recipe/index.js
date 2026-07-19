const cloud = require('@cloudbase/node-sdk')
const first = result => Array.isArray(result.data) ? result.data[0] : result.data

exports.main = async event => {
  const { recipeId, recipe } = event
  if (!recipeId || !recipe) return { code: 1, message: '参数缺失' }
  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
  const db = app.database()
  const wxContext = app.auth().getUserInfo()
  const openId = wxContext.openId || wxContext.OPENID
  if (!openId) return { code: 401, message: '未登录' }

  let transaction
  try {
    const familyResult = await db.collection('family').where({ members: openId }).limit(2).get()
    if ((familyResult.data || []).length !== 1) return { code: 403, message: '家庭归属异常或未加入家庭' }
    const familyId = familyResult.data[0]._id
    const relationResult = await db.collection('family_recipes')
      .where({ family_id: familyId, recipe_id: recipeId, deleted: false }).limit(2).get()
    if ((relationResult.data || []).length !== 1) return { code: 3, message: '无权修改该菜谱' }

    transaction = await db.startTransaction()
    const family = first(await transaction.collection('family').doc(familyId).get())
    const relation = first(await transaction.collection('family_recipes').doc(relationResult.data[0]._id).get())
    if (!family || !(family.members || []).includes(openId) || !relation || relation.deleted) {
      throw new Error('授权状态已变化')
    }
    const { _id, created_by, createdAt, updatedAt, ...safeRecipe } = recipe
    await transaction.collection('recipes').doc(recipeId).update({ ...safeRecipe, updatedAt: db.serverDate() })
    await transaction.commit()
    return { code: 0, message: '更新成功', data: first(await db.collection('recipes').doc(recipeId).get()) }
  } catch (error) {
    if (transaction) await transaction.rollback().catch(() => {})
    return { code: 2, message: '数据库错误: ' + error.message }
  }
}
