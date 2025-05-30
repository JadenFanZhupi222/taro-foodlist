'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({
  env: cloudbase.DYNAMIC_CURRENT_ENV,
});
const db = app.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = app.auth().getUserInfo();
  const openId = wxContext.openId || wxContext.OPENID;
  const { familyName } = event;

  try {
    // 检查用户是否已有家庭
    const existingFamily = await db.collection('family')
      .where({
        members: openId
      })
      .get();

    if (existingFamily.data.length > 0) {
      return {
        code: 1,
        data: null,
        message: '用户已加入其他家庭'
      };
    }

    // 创建新家庭
    const familyData = {
      name: familyName,
      family_owner: openId,
      members: [openId],
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    };

    const result = await db.collection('family').add({
      ...familyData
    });

    // 更新user表role为owner和family_id
    await db.collection('user').where({ openId }).update({
      role: 'owner',
      family_id: result.id || result._id
    });

    return {
      code: 0,
      data: {
        ...familyData,
        _id: result.id || result._id
      },
      message: '创建家庭成功'
    };
  } catch (error) {
    return {
      code: -1,
      data: null,
      message: '创建家庭失败：' + error.message
    };
  }
}; 