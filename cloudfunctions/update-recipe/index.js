const cloud = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  const { recipeId, recipe } = event;
  if (!recipeId || !recipe) {
    return { code: 1, message: '参数缺失' };
  }

  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
  const db = app.database();

  try {
    await db.collection('recipes').doc(recipeId).update(recipe);
    const recipeDoc = await db.collection('recipes').doc(recipeId).get();
    return {
      code: 0,
      message: '更新成功',
      data: recipeDoc.data[0]
    };
  } catch (e) {
    return { code: 2, message: '数据库错误: ' + e.message };
  }
}; 