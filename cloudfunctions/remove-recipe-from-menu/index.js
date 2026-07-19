const cloud = require('@cloudbase/node-sdk')
const first = result => Array.isArray(result.data) ? result.data[0] : result.data
const todayKey = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date())

exports.main = async event => {
  const { menuId, recipeId } = event
  if (!menuId || !recipeId) return { code: 1, message: 'menuId和recipeId不能为空' }
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
    const menu = first(await transaction.collection('daily_menu').doc(menuId).get())
    if (!family || !(family.members || []).includes(openId)) throw new Error('家庭成员身份已失效')
    if (!menu) {
      await transaction.rollback()
      transaction = null
      return { code: 2, message: '未找到菜单' }
    }
    if (menu.family_id !== familyId) throw new Error('无权操作该菜单')
    if (menu.date < todayKey()) throw new Error('不能删除历史日期菜单')

    const recipes = (menu.recipes || [])
      .filter(item => item.recipe_id !== recipeId)
      .map((item, index) => ({ ...item, order: (index + 1) * 100 }))
    await transaction.collection('daily_menu').doc(menuId).update({ recipes, updatedAt: db.serverDate() })
    await transaction.commit()
    return { code: 0, message: '删除成功', data: { ...menu, recipes } }
  } catch (error) {
    if (transaction) await transaction.rollback().catch(() => {})
    return { code: 500, message: error.message }
  }
}
