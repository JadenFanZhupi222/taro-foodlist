const cloud = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  const { familyId, recipeId } = event;
  if (!familyId || !recipeId) {
    return { code: 1, message: '参数缺失' };
  }

  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
  const db = app.database();

  try {
    // 软删除：只更新 deleted 字段
    await db.collection('recipes').doc(recipeId).update({
      deleted: true
    });
    // 不再从家庭 recipes 字段移除
    return { code: 0, message: '软删除成功' };
  } catch (e) {
    return { code: 2, message: '数据库错误: ' + e.message };
  }
}; 