// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    // 清除用户登录态
    // 注意：微信小程序会自动清除登录态，这里主要是为了记录日志
    return {
      success: true,
      message: '退出登录成功'
    }
  } catch (error) {
    return {
      success: false,
      message: '退出登录失败',
      error: error.message
    }
  }
} 