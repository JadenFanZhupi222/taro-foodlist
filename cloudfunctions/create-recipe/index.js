const cloud = require('@cloudbase/node-sdk')

const first = result => Array.isArray(result.data) ? result.data[0] : result.data
const relationKey = (familyId, recipeId) => `${encodeURIComponent(familyId)}_${encodeURIComponent(recipeId)}`

exports.main = async event => {
  const recipe = event.recipe
  if (!recipe || !recipe.name || !recipe.type) return { code: 1, message: '参数缺失' }

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

    transaction = await db.startTransaction()
    const family = first(await transaction.collection('family').doc(familyId).get())
    if (!family || !(family.members || []).includes(openId)) throw new Error('家庭成员身份已失效')

    const { _id, created_by, createdAt, updatedAt, ...safeRecipe } = recipe
    const addResult = await transaction.collection('recipes').add({
      ...safeRecipe,
      created_by: openId,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    })
    const recipeId = addResult.id || addResult._id
    if (!recipeId) throw new Error('菜谱创建失败')

    await transaction.collection('family_recipes').doc(relationKey(familyId, recipeId)).set({
      family_id: familyId,
      recipe_id: recipeId,
      order: Date.now(),
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
      createdby: openId,
      owner: openId,
      deleted: false
    })
    await transaction.commit()
    const created = first(await db.collection('recipes').doc(recipeId).get())
    return { code: 0, message: '创建成功', data: created }
  } catch (error) {
    if (transaction) await transaction.rollback().catch(() => {})
    return { code: 2, message: '数据库错误: ' + error.message }
  }
}
