
'use strict';

const tcb = require('@cloudbase/node-sdk');
const app = tcb.init({
  env: tcb.DYNAMIC_CURRENT_ENV
});
const db = app.database();
const userCollection = db.collection('user');

exports.main = async (event, context) => {
  const { openId, avatarFileId, nickname } = event;
  if (!openId || !avatarFileId || !nickname) {
    return {
      success: false,
      message: '头像和昵称不能为空'
    };
  }

  try {
    await userCollection.where({
      openId: openId
    }).update({
      avatar: avatarFileId,
      nickname: nickname
    });

    return {
      success: true,
      message: '更新成功'
    };
  } catch (error) {
    return {
      success: false,
      message: '更新失败',
      error
    };
  }
};
