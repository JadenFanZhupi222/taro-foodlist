const cloud = require('@cloudbase/node-sdk')

const getShanghaiDateKey = (date = new Date()) => {
  // en-CA 格式为 YYYY-MM-DD；指定上海时区，避免云端 UTC 导致日期错一天
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

/**
 * event: {
 *   familyId: string,
 *   date: string, // '2024-06-01'
 *   recipe: { recipeId: string }, // 不再需要 order
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
  const dateStr = typeof date === 'string' ? date.slice(0, 10) : getShanghaiDateKey(date)

  // 判断是否为今天及以后
  const todayStr = getShanghaiDateKey()
  if (dateStr < todayStr) {
    return { code: 2, message: '不能添加历史日期菜单' }
  }

  // 查找当天菜单
  const dailyMenuRes = await db.collection('daily_menu')
    .where({ family_id: familyId, date: dateStr })
    .get()

  let dailyMenu = dailyMenuRes.data[0]

  if (!dailyMenu) {
    // 没有则新建，第一个食谱的 order 为 100
    const newMenu = {
      family_id: familyId,
      date: dateStr,
      recipes: [{ ...recipe, order: 100 }],
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
      // 找到当前最大的 order 值
      const maxOrder = Math.max(...dailyMenu.recipes.map(r => r.order), 0)
      // 新食谱的 order 为最大 order + 100
      const newRecipe = { ...recipe, order: maxOrder + 100 }
      dailyMenu.recipes.push(newRecipe)
      await db.collection('daily_menu').doc(dailyMenu._id).update({
        recipes: dailyMenu.recipes,
        updatedAt: new Date()
      })
    }
    return { code: 0, message: '已更新', data: dailyMenu }
  }
} 