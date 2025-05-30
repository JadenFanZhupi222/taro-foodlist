

'use strict';

const cloud = require('wx-server-sdk');
const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});
const db = app.database();

exports.main = async (event, context) => {
  // 检查是否传入了code参数
  if (!event.code) {
    return {
      success: false,
      message: '缺少必要的code参数'
    };
  }

  try {
    const wxContext = cloud.getWXContext();

    // 调用微信登录接口
    const openId = wxContext.OPENID;
    const appId = wxContext.APPID;
    const unionId = wxContext.UNIONID;

    // 查询用户是否已存在
    const userCollection = db.collection('user');

    const user = await userCollection.where({
      openId: openId
    }).get();

    if (user.data.length > 0) {
      // 用户已存在，返回用户信息
      return {
        success: true,
        data: user.data[0]
      };
    } else {
      // 用户不存在，创建用户
      const nickname = `微信用户`;
      const avatar = 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132'; // 默认头像URL

      const createTime = db.serverDate()
      const newUser = await userCollection.add({
        openId: openId,
        appId: appId,
        unionId: unionId,
        nickname: nickname,
        avatar: avatar,
        createTime: createTime
      });

      // 返回新创建的用户信息
      return {
        success: true,
        data: {
          _id: newUser.id,
          openId: openId,
          appId: appId,
          unionId: unionId,
          nickname: nickname,
          avatar: avatar,
          createTime: createTime
        }
      };
    }
  } catch (error) {
    // 打印详细错误信息
    console.error('微信登录错误详情:', error);

    // 处理错误情况
    return {
      success: false,
      message: '微信登录失败',
      error: error.message,
      // 添加更多错误详情
      errorDetails: {
        code: error.code,
        stack: error.stack
      }
    };
  }
};

