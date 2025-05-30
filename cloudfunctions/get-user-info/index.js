'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({
  env: cloudbase.DYNAMIC_CURRENT_ENV,
});
const db = app.database();

// event: { openIds: string[] }
exports.main = async (event, context) => {
  const { openIds } = event;
  if (!openIds || !Array.isArray(openIds) || openIds.length === 0) {
    return {
      code: 1,
      data: [],
      message: 'openIds不能为空'
    };
  }
  try {
    const res = await db.collection('user').where({
      openId: db.command.in(openIds)
    }).get();
    return {
      code: 0,
      data: res.data,
      message: '获取用户信息成功'
    };
  } catch (error) {
    return {
      code: -1,
      data: [],
      message: '获取用户信息失败：' + error.message
    };
  }
}; 