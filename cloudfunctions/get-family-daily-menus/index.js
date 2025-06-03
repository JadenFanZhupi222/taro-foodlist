const cloud = require('@cloudbase/node-sdk')

exports.main = async (event, context) => {
  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
  const db = app.database()
  const { familyId } = event
  if (!familyId) {
    return { code: 1, message: 'familyId不能为空', data: [] }
  }
  try {
    const res = await db.collection('daily_menu').where({ family_id: familyId }).get()
    return { code: 0, message: '获取成功', data: res.data }
  } catch (error) {
    return { code: -1, message: error.message, data: [] }
  }
} 