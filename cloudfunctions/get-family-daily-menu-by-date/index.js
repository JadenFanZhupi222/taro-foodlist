const cloud = require('@cloudbase/node-sdk')

exports.main = async (event, context) => {
  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
  const db = app.database()
  const { date } = event
  if (!date) {
    return { code: 1, message: 'date不能为空', data: null }
  }
  // 鉴权
  const wxContext = app.auth().getUserInfo()
  const openId = wxContext.openId || wxContext.OPENID
  if (!openId) return { code: 401, message: '未登录', data: null }
  const myFamilyRes = await db.collection('family').where({ members: openId }).get()
  const myFamily = myFamilyRes.data[0]
  if (!myFamily) return { code: 403, message: '未加入家庭', data: null }
  const familyId = myFamily._id
  try {
    const res = await db.collection('daily_menu').where({ family_id: familyId, date: date }).get()
    return { code: 0, message: '获取成功', data: res.data[0] || null }
  } catch (error) {
    return { code: -1, message: error.message, data: null }
  }
} 