const cloud = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  const { familyId } = event;
  if (!familyId) {
    return { code: 1, message: '参数缺失' };
  }

  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
  const db = app.database();

  try {
    // 1. 获取家庭文档
    const familyRes = await db.collection('family').doc(familyId).get();
    const family = familyRes.data[0];
    if (!family) {
      return { code: 2, message: '未找到家庭' };
    }
    const recipeIds = family.recipes || [];
    if (recipeIds.length === 0) {
      return { code: 0, message: '无菜谱', data: [] };
    }
    // 2. 批量获取菜谱
    const recipesRes = await db.collection('recipes').where({
      _id: db.command.in(recipeIds)
    }).get();
    return {
      code: 0,
      message: '获取成功',
      data: recipesRes.data
    };
  } catch (e) {
    return { code: 2, message: '数据库错误: ' + e.message };
  }
}; 