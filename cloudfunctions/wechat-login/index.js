'use strict';

const cloud = require('wx-server-sdk');
const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});
const db = app.database();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

exports.main = async (event, context) => {
  // 检查是否传入了code参数
  if (!event.code) {
    return {
      code: 1,
      message: '缺少必要的code参数',
      data: null
    };
  }

  // 检查 JWT_SECRET 是否设置
  if (!JWT_SECRET) {
    return {
      code: 2,
      message: 'JWT_SECRET 未设置',
      data: null,
      error: 'secretOrPrivateKey必须有值'
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
      // 用户已存在。以 family 为单一真相推导 role / family_id（user.role 已不再维护，user.family_id 仅作缓存）
      const u = user.data[0];
      const famRes = await db.collection('family').where({ members: u.openId }).get();
      const fam = famRes.data[0];
      const family_id = fam ? fam._id : '';
      const role = fam ? (fam.family_owner === u.openId ? 'owner' : 'member') : '';
      const token = jwt.sign({
        openId: u.openId,
        userId: u._id,
        family_id,
        role
      }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return {
        code: 0,
        message: '登录成功',
        data: {
          ...u,
          family_id,
          role,
          token
        }
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

      // 生成token
      const token = jwt.sign({
        openId: openId,
        userId: newUser.id,
        family_id: '',
        role: ''
      }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      // 返回新创建的用户信息
      return {
        code: 0,
        message: '注册并登录成功',
        data: {
          _id: newUser.id,
          openId: openId,
          appId: appId,
          unionId: unionId,
          nickname: nickname,
          avatar: avatar,
          createTime: createTime,
          token
        }
      };
    }
  } catch (error) {
    // 打印详细错误信息
    console.error('微信登录错误详情:', error);

    // 处理错误情况
    return {
      code: 2,
      message: '微信登录失败',
      data: null,
      error: error.message,
      // 添加更多错误详情
      errorDetails: {
        code: error.code,
        stack: error.stack
      }
    };
  }
};

