const cloud = require('@cloudbase/node-sdk')
const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
  // 获取当前用户 openId
  const wxContext = app.auth().getUserInfo()
  const openId = wxContext.openId || wxContext.OPENID

  // 查找用户当前家庭
  const userRes = await db.collection('user').where({ openId }).get()
  if (!userRes.data || !userRes.data[0] || !userRes.data[0].family_id) {
    return { code: 1, message: '用户未加入任何家庭' }
  }
  const familyId = userRes.data[0].family_id

  // 获取当前家庭信息
  const familyRes = await db.collection('family').doc(familyId).get()
  if (!familyRes.data || !familyRes.data[0]) {
    return { code: 2, message: '家庭不存在' }
  }
  const family = familyRes.data[0]
  const members = family.members || []
  const isOwner = family.family_owner === openId

  // 从家庭成员中移除
  const newMembers = members.filter(m => m !== openId)
  await db.collection('family').doc(familyId).update({
    members: _.pull(openId),
    updatedAt: new Date()
  })

  // 清空用户的 family_id 和 role
  await db.collection('user').where({ openId }).update({
    family_id: '',
    role: '',
    updatedAt: Date.now()
  })

  // 如果没有其他成员则直接删除家庭
  if (newMembers.length === 0) {
    await db.collection('family').doc(familyId).remove()
    return { code: 0, message: '已退出家庭，家庭已解散' }
  }

  // 如果当前用户是 owner，转移 owner 给排序第二的成员
  if (isOwner) {
    const newOwner = newMembers[0] // 排序第二的成员（原 members[1]）
    await db.collection('family').doc(familyId).update({
      family_owner: newOwner
    })
    // 更新新 owner 的 user.role 字段
    await db.collection('user').where({ openId: newOwner }).update({
      role: 'owner',
      updatedAt: Date.now()
    })
  }

  return { code: 0, message: '已退出家庭' }
} 