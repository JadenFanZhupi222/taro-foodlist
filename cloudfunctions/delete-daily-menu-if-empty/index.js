const cloud = require('@cloudbase/node-sdk')

/**
 * event: {
 *   familyId: string,
 *   date: string // '2024-06-01'
 * }
 */
exports.main = async (event, context) => {
  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
  const db = app.database()
  const { familyId, date } = event

  if (!familyId || !date) {
    return { code: 1, message: '参数缺失' }
  }

  const dailyMenuRes = await db.collection('daily_menu')
    .where({ family_id: familyId, date })
    .get()

  const dailyMenu = dailyMenuRes.data[0]
  if (!dailyMenu) {
    return { code: 2, message: '未找到 daily_menu' }
  }

  if (!dailyMenu.recipes || dailyMenu.recipes.length === 0) {
    await db.collection('daily_menu').doc(dailyMenu._id).remove()
    return { code: 0, message: '已删除 daily_menu' }
  } else {
    return { code: 3, message: 'recipes 不为空，不删除' }
  }
} 