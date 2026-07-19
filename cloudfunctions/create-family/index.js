'use strict'

const cloudbase = require('@cloudbase/node-sdk')
const app = cloudbase.init({ env: cloudbase.DYNAMIC_CURRENT_ENV })
const db = app.database()

const memberKey = openId => encodeURIComponent(openId)
const first = result => Array.isArray(result.data) ? result.data[0] : result.data

exports.main = async event => {
  const wxContext = app.auth().getUserInfo()
  const openId = wxContext.openId || wxContext.OPENID
  const familyName = typeof event.familyName === 'string' ? event.familyName.trim() : ''
  if (!openId) return { code: 401, data: null, message: '未登录' }
  if (!familyName) return { code: 1, data: null, message: '家庭名称不能为空' }

  let transaction
  try {
    const [existingFamily, userResult] = await Promise.all([
      db.collection('family').where({ members: openId }).limit(2).get(),
      db.collection('user').where({ openId }).limit(1).get()
    ])
    if ((existingFamily.data || []).length > 0) {
      return { code: 1, data: null, message: '用户已加入其他家庭' }
    }
    const user = first(userResult)
    if (!user) return { code: 404, data: null, message: '用户不存在' }

    transaction = await db.startTransaction()
    const membershipResult = await transaction.collection('family_members').doc(memberKey(openId)).get()
    if (first(membershipResult)) {
      await transaction.rollback()
      return { code: 1, data: null, message: '用户已加入其他家庭' }
    }

    const familyData = {
      name: familyName,
      family_owner: openId,
      members: [openId],
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
    const addResult = await transaction.collection('family').add(familyData)
    const familyId = addResult.id || addResult._id
    await transaction.collection('family_members').doc(memberKey(openId)).set({
      openId,
      family_id: familyId,
      role: 'owner',
      joinedAt: db.serverDate(),
      updatedAt: db.serverDate()
    })
    await transaction.collection('user').doc(user._id).update({
      family_id: familyId,
      updatedAt: db.serverDate()
    })
    await transaction.commit()

    return { code: 0, data: { ...familyData, _id: familyId }, message: '创建家庭成功' }
  } catch (error) {
    if (transaction) await transaction.rollback().catch(() => {})
    return { code: -1, data: null, message: '创建家庭失败：' + error.message }
  }
}
