const cloud = require('@cloudbase/node-sdk')

exports.main = async (event, context) => {
  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
  const db = app.database()
  const now = new Date()
  const expireDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30天前
  const expireStr = expireDate.toISOString().slice(0, 10)
  const res = await db.collection('daily_menu')
    .where({ date: db.command.lt(expireStr) })
    .remove()
  return { code: 0, message: '清理完成', deleted: res.deleted }
} 