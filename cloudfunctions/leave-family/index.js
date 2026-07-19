const cloud = require('@cloudbase/node-sdk')
const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
const db = app.database()

const memberKey = openId => encodeURIComponent(openId)
const first = result => Array.isArray(result.data) ? result.data[0] : result.data

exports.main = async () => {
  const wxContext = app.auth().getUserInfo()
  const openId = wxContext.openId || wxContext.OPENID
  if (!openId) return { code: 401, message: '未登录' }

  let transaction
  try {
    const [legacyResult, userResult] = await Promise.all([
      db.collection('family').where({ members: openId }).limit(2).get(),
      db.collection('user').where({ openId }).limit(1).get()
    ])
    const legacyFamilies = legacyResult.data || []
    if (legacyFamilies.length > 1) return { code: 409, message: '家庭归属数据冲突，请联系管理员' }
    const user = first(userResult)
    if (!user) return { code: 404, message: '用户不存在' }

    transaction = await db.startTransaction()
    const membership = first(await transaction.collection('family_members').doc(memberKey(openId)).get())
    const familyId = membership?.family_id || legacyFamilies[0]?._id
    if (!familyId) {
      await transaction.rollback()
      return { code: 1, message: '用户未加入任何家庭' }
    }
    const family = first(await transaction.collection('family').doc(familyId).get())
    if (!family) {
      await transaction.collection('family_members').doc(memberKey(openId)).delete()
      await transaction.collection('user').doc(user._id).update({ family_id: '', updatedAt: db.serverDate() })
      await transaction.commit()
      return { code: 0, message: '已清理失效的家庭归属' }
    }

    const newMembers = (family.members || []).filter(id => id !== openId)
    if (newMembers.length === 0) {
      await transaction.collection('family').doc(familyId).delete()
    } else {
      const update = { members: newMembers, updatedAt: db.serverDate() }
      if (family.family_owner === openId) update.family_owner = newMembers[0]
      await transaction.collection('family').doc(familyId).update(update)
      if (family.family_owner === openId) {
        await transaction.collection('family_members').doc(memberKey(newMembers[0])).set({
          openId: newMembers[0],
          family_id: familyId,
          role: 'owner',
          updatedAt: db.serverDate()
        })
      }
    }
    await transaction.collection('family_members').doc(memberKey(openId)).delete()
    await transaction.collection('user').doc(user._id).update({ family_id: '', updatedAt: db.serverDate() })
    await transaction.commit()
    return { code: 0, message: newMembers.length ? '已退出家庭' : '已退出家庭，家庭已解散' }
  } catch (error) {
    if (transaction) await transaction.rollback().catch(() => {})
    return { code: 500, message: error.message || '服务器错误' }
  }
}
