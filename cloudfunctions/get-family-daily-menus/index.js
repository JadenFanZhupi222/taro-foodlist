const cloud = require('@cloudbase/node-sdk')

exports.main = async (event, context) => {
  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
  const db = app.database()
  // 鉴权
  const wxContext = app.auth().getUserInfo()
  const openId = wxContext.openId || wxContext.OPENID
  if (!openId) return { code: 401, message: '未登录', data: [] }
  const myFamilyRes = await db.collection('family').where({ members: openId }).get()
  const myFamily = myFamilyRes.data[0]
  if (!myFamily) return { code: 403, message: '未加入家庭', data: [] }
  const familyId = myFamily._id
  try {
    const pageSize = 100
    let offset = 0
    let all = []

    while (true) {
      const res = await db.collection('daily_menu')
        .where({ family_id: familyId })
        .orderBy('date', 'desc')
        .skip(offset)
        .limit(pageSize)
        .get()

      const batch = res.data || []
      all = all.concat(batch)

      if (batch.length < pageSize) break
      offset += pageSize
    }

    return { code: 0, message: '获取成功', data: all }
  } catch (error) {
    return { code: -1, message: error.message, data: [] }
  }
} 