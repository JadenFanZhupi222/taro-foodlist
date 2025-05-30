// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  const { familyId } = event

  try {
    // 检查用户是否已有家庭
    const existingFamily = await db.collection('family')
      .where({
        members: db.command.elemMatch({
          userId: openId
        })
      })
      .get()

    if (existingFamily.data.length > 0) {
      return {
        code: 1,
        data: null,
        message: '用户已加入其他家庭'
      }
    }

    // 获取目标家庭信息
    const familyResult = await db.collection('family')
      .doc(familyId)
      .get()

    if (!familyResult.data) {
      return {
        code: 2,
        data: null,
        message: '家庭不存在'
      }
    }

    const family = familyResult.data

    // 检查家庭成员数量
    if (family.members.length >= 10) {
      return {
        code: 3,
        data: null,
        message: '家庭成员已达上限'
      }
    }

    // 添加新成员
    const result = await db.collection('family')
      .doc(familyId)
      .update({
        data: {
          members: db.command.push({
            userId: openId,
            role: 'member',
            permissions: ['view', 'comment']
          }),
          updatedAt: db.serverDate()
        }
      })

    return {
      code: 0,
      data: {
        ...family,
        members: [
          ...family.members,
          {
            userId: openId,
            role: 'member',
            permissions: ['view', 'comment']
          }
        ]
      },
      message: '加入家庭成功'
    }
  } catch (error) {
    return {
      code: -1,
      data: null,
      message: '加入家庭失败：' + error.message
    }
  }
} 