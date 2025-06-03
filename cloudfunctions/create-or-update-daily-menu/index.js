const cloud = require('@cloudbase/node-sdk')

/**
 * event: {
 *   familyId: string,
 *   date: string, // '2024-06-01'
 *   recipe: { recipeId: string, order: number },
 *   userId: string // 操作人
 * }
 */
exports.main = async (event, context) => {
  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
  const db = app.database()
  const { familyId, date, recipe, userId } = event

  if (!familyId || !date || !recipe || !userId) {
    return { code: 1, message: '参数缺失' }
  }

  // 统一 date 字段为字符串
  const dateStr = typeof date === 'string' ? date.slice(0, 10) : date.toISOString().slice(0, 10)

  // 判断是否为今天及以后
  const todayStr = new Date().toISOString().slice(0, 10)
  if (dateStr < todayStr) {
    return { code: 2, message: '不能添加历史日期菜单' }
  }

  // 查找当天菜单
  const dailyMenuRes = await db.collection('daily_menu')
    .where({ family_id: familyId, date: dateStr })
    .get()

  let dailyMenu = dailyMenuRes.data[0]

  if (!dailyMenu) {
    // 没有则新建
    const newMenu = {
      family_id: familyId,
      date: dateStr,
      recipes: [recipe],
      _openid: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const addRes = await db.collection('daily_menu').add(newMenu)
    return { code: 0, message: '创建成功', data: { _id: addRes.id, ...newMenu } }
  } else {
    // 已有则追加菜品
    const exists = dailyMenu.recipes.some(r => r.recipe_id === recipe.recipe_id)
    if (!exists) {
      dailyMenu.recipes.push(recipe)
      await db.collection('daily_menu').doc(dailyMenu._id).update({
        recipes: dailyMenu.recipes,
        updatedAt: new Date()
      })
    }
    return { code: 0, message: '已更新', data: dailyMenu }
  }
} 