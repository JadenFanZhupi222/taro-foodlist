const cloud = require('@cloudbase/node-sdk')

const first = result => Array.isArray(result.data) ? result.data[0] : result.data
const dateKey = value => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) throw new TypeError('日期格式无效')
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date)
}
const menuKey = (familyId, date) => `${encodeURIComponent(familyId)}_${dateKey(date)}`

exports.main = async event => {
  const { date, recipe } = event
  if (!date || !recipe?.recipe_id) return { code: 1, message: '参数缺失' }

  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
  const db = app.database()
  const wxContext = app.auth().getUserInfo()
  const openId = wxContext.openId || wxContext.OPENID
  if (!openId) return { code: 401, message: '未登录' }

  let transaction
  try {
    const dateStr = dateKey(date)
    if (dateStr < dateKey(new Date())) return { code: 2, message: '不能添加历史日期菜单' }

    const familyResult = await db.collection('family').where({ members: openId }).limit(2).get()
    if ((familyResult.data || []).length !== 1) return { code: 403, message: '家庭归属异常或未加入家庭' }
    const familyId = familyResult.data[0]._id

    const [recipeResult, relationResult, oldMenusResult] = await Promise.all([
      db.collection('recipes').doc(recipe.recipe_id).get(),
      db.collection('family_recipes').where({
        family_id: familyId, recipe_id: recipe.recipe_id, deleted: false
      }).limit(1).get(),
      db.collection('daily_menu').where({ family_id: familyId, date: dateStr }).limit(2).get()
    ])
    const recipeDoc = first(recipeResult)
    if (!recipeDoc || !(relationResult.data || []).length) return { code: 3, message: '该菜谱不属于当前家庭' }
    const oldMenus = oldMenusResult.data || []
    if (oldMenus.length > 1) return { code: 409, message: '当天存在重复菜单，请联系管理员处理' }

    transaction = await db.startTransaction()
    const keyId = menuKey(familyId, dateStr)
    let keyDoc = first(await transaction.collection('daily_menu_keys').doc(keyId).get())
    let menu

    if (!keyDoc && oldMenus.length === 1) {
      keyDoc = { menu_id: oldMenus[0]._id }
      await transaction.collection('daily_menu_keys').doc(keyId).set({
        family_id: familyId, date: dateStr, menu_id: oldMenus[0]._id, createdAt: db.serverDate()
      })
    }

    if (keyDoc) {
      menu = first(await transaction.collection('daily_menu').doc(keyDoc.menu_id).get())
      if (!menu || menu.family_id !== familyId || menu.date !== dateStr) throw new Error('菜单唯一键指向无效数据')
    } else {
      const newMenu = {
        family_id: familyId,
        date: dateStr,
        recipes: [],
        _openid: openId,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
      const added = await transaction.collection('daily_menu').add(newMenu)
      const menuId = added.id || added._id
      menu = { _id: menuId, ...newMenu }
      await transaction.collection('daily_menu_keys').doc(keyId).set({
        family_id: familyId, date: dateStr, menu_id: menuId, createdAt: db.serverDate()
      })
    }

    const recipes = menu.recipes || []
    if (!recipes.some(item => item.recipe_id === recipe.recipe_id)) {
      const maxOrder = Math.max(...recipes.map(item => Number(item.order) || 0), 0)
      recipes.push({ recipe_id: recipe.recipe_id, name: recipeDoc.name, type: recipeDoc.type, order: maxOrder + 100 })
      await transaction.collection('daily_menu').doc(menu._id).update({ recipes, updatedAt: db.serverDate() })
    }
    await transaction.commit()
    return { code: 0, message: '已更新', data: { ...menu, recipes } }
  } catch (error) {
    if (transaction) await transaction.rollback().catch(() => {})
    return { code: error.message.includes('write conflict') ? 409 : 500, message: error.message }
  }
}
