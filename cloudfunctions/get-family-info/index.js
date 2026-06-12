'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({
  env: cloudbase.DYNAMIC_CURRENT_ENV,
});
const db = app.database();

// 云函数入口函数
exports.main = async (event, context) => {
  // tcb获取用户信息
  const wxContext = app.auth().getUserInfo();
  const openId = wxContext.openId || wxContext.OPENID;

  try {
    // 查询用户是否已有家庭
    const familyResult = await db.collection('family')
      .where({
        members: openId
      })
      .get();

    if (familyResult.data.length > 0) {
      const family = familyResult.data[0];
      // 用 members 里的 openId 查成员详细信息
      const membersOpenIds = family.members || [];
      let membersInfo = [];
      if (membersOpenIds.length > 0) {
        // 直接查 user 表，省掉一次跨云函数调用
        const membersRes = await db.collection('user')
          .where({ openId: db.command.in(membersOpenIds) })
          .get();
        membersInfo = membersRes.data || [];
      }
      return {
        code: 0,
        data: {
          ...family,
          membersInfo
        },
        message: '获取家庭信息成功'
      };
    } else {
      // 用户没有家庭（正常状态，返回 code 0 + null，避免前端误报为错误）
      return {
        code: 0,
        data: null,
        message: '用户未加入任何家庭'
      };
    }
  } catch (error) {
    return {
      code: -1,
      data: null,
      message: '获取家庭信息失败：' + error.message
    };
  }
}; 