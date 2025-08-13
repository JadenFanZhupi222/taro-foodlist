const cloud = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  const { familyId, recipeId } = event;
  if (!familyId || !recipeId) {
    return { code: 1, message: '参数缺失' };
  }

  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
  const db = app.database();

  try {
    // 1. 软删除菜谱
    await db.collection('recipes').doc(recipeId).update({
      deleted: true,
      updatedAt: new Date()
    });

    // 2. 标记关联记录为删除
    await db.collection('family_recipes')
      .where({
        family_id: familyId,
        recipe_id: recipeId
      })
      .update({
        deleted: true,
        updatedAt: new Date()
      });

    return { code: 0, message: '删除成功' };
  } catch (e) {
    return { code: 2, message: '数据库错误: ' + e.message };
  }
}; 