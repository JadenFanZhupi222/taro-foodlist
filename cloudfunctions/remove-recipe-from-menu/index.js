const cloud = require('@cloudbase/node-sdk')

const getShanghaiDateKey = (date = new Date()) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

exports.main = async (event, context) => {
  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
  const db = app.database()
  const { menuId, recipeId } = event

  if (!menuId || !recipeId) {
    return { code: 1, message: 'menuId和recipeId不能为空' }
  }

  // 鉴权
  const wxContext = app.auth().getUserInfo()
  const openId = wxContext.openId || wxContext.OPENID
  if (!openId) return { code: 401, message: '未登录' }
  const myFamilyRes = await db.collection('family').where({ members: openId }).get()
  const myFamily = myFamilyRes.data[0]
  if (!myFamily) return { code: 403, message: '未加入家庭' }
  const familyId = myFamily._id

  try {
    // 查找菜单
    const menuRes = await db.collection('daily_menu').doc(menuId).get()
    const menu = menuRes.data[0]
    if (!menu) {
      return { code: 2, message: '未找到菜单' }
    }
    // 校验菜单属于本家庭，避免越权操作
    if (menu.family_id !== familyId) {
      return { code: 3, message: '无权操作该菜单' }
    }

    // 判断是否为今天及以后
    const todayStr = getShanghaiDateKey()
    if (menu.date < todayStr) {
      return { code: 2, message: '不能删除历史日期菜单' }
    }
    
    // 移除 recipes 中的指定项
    const newRecipes = (menu.recipes || [])
      .filter(r => r.recipe_id !== recipeId)
      // 重新计算 order，确保是连续的
      .map((recipe, index) => ({
        ...recipe,
        order: index + 1
      }))

    await db.collection('daily_menu').doc(menuId).update({
      recipes: newRecipes,
      updatedAt: new Date()
    })
    return { code: 0, message: '删除成功', data: { ...menu, recipes: newRecipes } }
  } catch (error) {
    return { code: -1, message: error.message }
  }
} 