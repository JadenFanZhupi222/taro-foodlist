const cloud = require('@cloudbase/node-sdk')

exports.main = async (event, context) => {
  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
  const db = app.database()
  const { familyId, date } = event
  if (!familyId || !date) {
    return { code: 1, message: 'familyId和date不能为空', data: null }
  }
  try {
    const res = await db.collection('daily_menu').where({ family_id: familyId, date }).get()
    return { code: 0, message: '获取成功', data: res.data[0] || null }
  } catch (error) {
    return { code: -1, message: error.message, data: null }
  }
} 