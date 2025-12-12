const cloud = require('@cloudbase/node-sdk')

exports.main = async (event, context) => {
  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
  const db = app.database()
  const { familyId } = event
  if (!familyId) {
    return { code: 1, message: 'familyId不能为空', data: [] }
  }
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