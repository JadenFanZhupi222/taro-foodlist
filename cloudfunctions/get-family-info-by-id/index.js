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
      const userInfoRes = await app.callFunction({
        name: 'get-user-info',
        data: { openIds: membersOpenIds }
      });
      if (userInfoRes.result && userInfoRes.result.code === 0) {
        membersInfo = userInfoRes.result.data;
      }
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