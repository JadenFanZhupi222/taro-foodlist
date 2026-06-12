'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({
  env: cloudbase.DYNAMIC_CURRENT_ENV,
});
const db = app.database();

// event: { familyId: string }
exports.main = async (event, context) => {
  const { familyId } = event;
  if (!familyId) {
    return {
      code: 1,
      data: null,
      message: 'familyId不能为空'
    };
  }
  // 鉴权：仅需登录（受邀者尚未加入该家庭，故允许按 id 查看基本信息）
  const wxContext = app.auth().getUserInfo();
  const openId = wxContext.openId || wxContext.OPENID;
  if (!openId) {
    return { code: 401, data: null, message: '未登录' };
  }
  try {
    // 查找家庭
    const familyResult = await db.collection('family').doc(familyId).get();
    if (!familyResult.data || familyResult.data.length === 0) {
      return {
        code: 2,
        data: null,
        message: '家庭不存在'
      };
    }
    const family = familyResult.data[0] || familyResult.data;

    // 查找成员详细信息
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
  } catch (error) {
    return {
      code: -1,
      data: null,
      message: '获取家庭信息失败：' + error.message
    };
  }
}; 