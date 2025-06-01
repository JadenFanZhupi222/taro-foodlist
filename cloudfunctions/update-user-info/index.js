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
      code: 1,
      message: '头像和昵称不能为空',
      data: null
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
