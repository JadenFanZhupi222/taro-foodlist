// 云函数入口文件
const cloud = require('@cloudbase/node-sdk')
const tcb = cloud.init({
  env: process.env.TCB_ENV || process.env.SCF_NAMESPACE
})
const db = tcb.database()
const _ = db.command

// 获取成员详细信息（直接查 user 表，省掉一次跨云函数调用）
async function getMembersInfo(openIdList) {
  if (!openIdList || openIdList.length === 0) return []
  const res = await db.collection('user')
    .where({ openId: _.in(openIdList) })
    .get()
  return res.data || []
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
    // 防串档：一人一家庭。若已在【别的】家庭则拒绝（与 create-family 行为对齐）。
    // 漏掉这条校验会让 openId 同时出现在多个 family.members 里，
    // 导致各处 family.where({members:openId}).data[0] 取到任意家庭 → 串档。
    const myFamilyRes = await familyColl.where({ members: openId }).get()
    const myFamily = myFamilyRes.data && myFamilyRes.data[0]
    if (myFamily && myFamily._id !== familyId) {
      return { code: 4, message: '你已加入其他家庭，请先退出当前家庭再加入' }
    }
    const members = family.members || []
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
        updatedAt: db.serverDate()
      })
    }
    // 3. 更新用户表（role 不再写入，统一由 family_owner 推导）
    await userColl.where({ openId }).update({
      family_id: familyId,
      updatedAt: db.serverDate()
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