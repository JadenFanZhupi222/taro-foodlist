const cloud = require('@cloudbase/node-sdk')
const app = cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = app.database()
const _ = db.command

const memberKey = openId => encodeURIComponent(openId)
const first = result => Array.isArray(result.data) ? result.data[0] : result.data

async function getMembersInfo(openIds) {
  if (!openIds || openIds.length === 0) return []
  const result = await db.collection('user').where({ openId: _.in(openIds) }).get()
  return result.data || []
}

exports.main = async event => {
  const familyId = event.familyId
  const wxContext = app.auth().getUserInfo()
  const openId = wxContext.openId || wxContext.OPENID
  if (!familyId || !openId) return { code: 1, message: '参数缺失' }

  let transaction
  try {
    const [legacyMembership, userResult] = await Promise.all([
      db.collection('family').where({ members: openId }).limit(2).get(),
      db.collection('user').where({ openId }).limit(1).get()
    ])
    const legacyFamilies = legacyMembership.data || []
    if (legacyFamilies.length > 1) return { code: 409, message: '家庭归属数据冲突，请联系管理员' }
    if (legacyFamilies[0] && legacyFamilies[0]._id !== familyId) {
      return { code: 4, message: '你已加入其他家庭，请先退出当前家庭再加入' }
    }
    const user = first(userResult)
    if (!user) return { code: 404, message: '用户不存在' }

    transaction = await db.startTransaction()
    const membership = first(await transaction.collection('family_members').doc(memberKey(openId)).get())
    if (membership && membership.family_id !== familyId) {
      await transaction.rollback()
      return { code: 4, message: '你已加入其他家庭，请先退出当前家庭再加入' }
    }
    const family = first(await transaction.collection('family').doc(familyId).get())
    if (!family) {
      await transaction.rollback()
      return { code: 2, message: '家庭不存在' }
    }

    const members = family.members || []
    if (!members.includes(openId)) {
      await transaction.collection('family').doc(familyId).update({
        members: _.push([openId]),
        updatedAt: db.serverDate()
      })
    }
    await transaction.collection('family_members').doc(memberKey(openId)).set({
      openId,
      family_id: familyId,
      role: family.family_owner === openId ? 'owner' : 'member',
      joinedAt: membership?.joinedAt || db.serverDate(),
      updatedAt: db.serverDate()
    })
    await transaction.collection('user').doc(user._id).update({
      family_id: familyId,
      updatedAt: db.serverDate()
    })
    await transaction.commit()
    transaction = null
    const latestMembers = members.includes(openId) ? members : [...members, openId]
    let membersInfo = []
    try {
      membersInfo = await getMembersInfo(latestMembers)
    } catch (error) {
      console.warn('加入家庭已提交，但成员详情回读失败', error)
    }
    return {
      code: members.includes(openId) ? 3 : 0,
      message: members.includes(openId) ? '已加入该家庭' : '加入家庭成功',
      data: { ...family, members: latestMembers, membersInfo }
    }
  } catch (error) {
    if (transaction) await transaction.rollback().catch(() => {})
    return { code: 500, message: error.message || '服务器错误' }
  }
}
