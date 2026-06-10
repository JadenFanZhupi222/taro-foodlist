'use strict';

const tcb = require('@cloudbase/node-sdk');
const app = tcb.init({
  env: tcb.DYNAMIC_CURRENT_ENV
});
const db = app.database();
const userCollection = db.collection('user');

exports.main = async (event, context) => {
  const { avatarFileId, nickname } = event;
  if (!avatarFileId || !nickname) {
    return {
      code: 1,
      message: '头像和昵称不能为空',
      data: null
    };
  }

  // 鉴权：只能修改自己的资料，openId 从可信上下文取
  const wxContext = app.auth().getUserInfo();
  const openId = wxContext.openId || wxContext.OPENID;
  if (!openId) {
    return { code: 401, message: '未登录', data: null };
  }

  try {
    await userCollection.where({
      openId: openId
    }).update({
      avatar: avatarFileId,
      nickname: nickname
    });

    return {
      code: 0,
      message: '更新成功',
      data: null
    };
  } catch (error) {
    return {
      code: 2,
      message: '更新失败',
      data: null,
      error
    };
  }
};
