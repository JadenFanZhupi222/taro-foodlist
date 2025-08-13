const cloud = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  const { familyId, recipe } = event;
  if (!familyId || !recipe || !recipe.name || !recipe.type) {
    return { code: 1, message: '参数缺失' };
  }

  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
  const db = app.database();

  try {
    // 1. 新增菜谱
    const addRes = await db.collection('recipes').add(recipe);
    const recipeId = addRes.id || addRes._id;
    if (!recipeId) {
      return { code: 2, message: '菜谱创建失败' };
    }

    // 2. 创建家庭菜谱关联记录
    await db.collection('family_recipes').add({
      family_id: familyId,
      recipe_id: recipeId,
      order: Date.now(), // 使用时间戳作为排序，新菜谱排在最后
      createdAt: new Date(),
      updatedAt: new Date(),
      createdby: recipe.created_by || '',
      owner: recipe.created_by || '',
      deleted: false
    });

    // 3. 返回新建菜谱详情
    const recipeDoc = await db.collection('recipes').doc(recipeId).get();
    return {
      code: 0,
      message: '创建成功',
      data: recipeDoc.data[0]
    };
  } catch (e) {
    return { code: 2, message: '数据库错误: ' + e.message };
  }
}; 