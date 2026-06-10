// 云函数入口文件
const cloud = require('@cloudbase/node-sdk')
const tcb = cloud.init({
  env: process.env.TCB_ENV || process.env.SCF_NAMESPACE
})
const db = tcb.database()
const _ = db.command

// 获取成员详细信息
async function getMembersInfo(openIdList) {
  // 调用 get-user-info 云函数，返回 membersInfo
  const res = await tcb.callFunction({
    name: 'get-user-info',
    data: { openIds: openIdList }
  })
  if (res.result && res.result.code === 0) {
    return res.result.data
  }
  return []
}

// 主入口
exports.main = async (event, context) => {
  const { familyId } = event
  // openId 从可信上下文取，避免冒名加入
  const wxContext = tcb.auth().getUserInfo()
  const openId = wxContext.openId || wxContext.OPENID
  if (!familyId || !openId) {
    return { code: 1, message: '参数缺失' }
  }
  const familyColl = db.collection('family')
  const userColl = db.collection('user')
  try {
    // 1. 查找家庭
    const familyRes = await familyColl.doc(familyId).get()
    if (!familyRes.data || familyRes.data.length === 0) {
      return { code: 2, message: '家庭不存在' }
    }
    const family = familyRes.data[0]
    const members = family.members
    // 2. 幂等性：如已是成员则跳过，否则加入
    let needUpdateFamily = !members.includes(openId)
    if (!needUpdateFamily) {
      // 已经是成员，直接返回
      const membersInfo = await getMembersInfo(members || [])
      return {
        code: 3,
        message: '已加入该家庭',
        data: {
          ...family,
          membersInfo
        }
      }
    }
    if (needUpdateFamily) {
      await familyColl.doc(familyId).update({
        members: _.push([openId]),
        updatedAt: new Date()
      })
    }
    // 3. 更新用户表
    await userColl.where({ openId }).update({
      family_id: familyId,
      role: 'member',
      updatedAt: Date.now()
    })
    // 4. 获取最新家庭信息
    const newFamilyRes = await familyColl.doc(familyId).get()
    const newFamily = newFamilyRes.data[0]
    // 5. 获取成员详细信息
    const membersInfo = await getMembersInfo(newFamily.members || [])
    // 6. 返回结构
    return {
      code: 0,
      data: {
        ...newFamily,
        membersInfo
      }
    }
  } catch (err) {
    return { code: 500, message: err.message || '服务器错误' }
  }
} 