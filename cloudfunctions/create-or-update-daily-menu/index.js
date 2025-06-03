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

  // 查找当天菜单
  const dailyMenuRes = await db.collection('daily_menu')
    .where({ family_id: familyId, date })
    .get()

  let dailyMenu = dailyMenuRes.data[0]

  if (!dailyMenu) {
    // 没有则新建
    const newMenu = {
      family_id: familyId,
      date,
      recipes: [recipe],
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const addRes = await db.collection('daily_menu').add(newMenu)
    return { code: 0, message: '创建成功', data: { _id: addRes.id, ...newMenu } }
  } else {
    // 已有则追加菜品
    const exists = dailyMenu.recipes.some(r => r.recipeId === recipe.recipeId)
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