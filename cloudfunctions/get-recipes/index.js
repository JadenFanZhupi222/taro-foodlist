const cloud = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  const { familyId } = event;
  if (!familyId) {
    return { code: 1, message: '参数缺失' };
  }

  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
  const db = app.database();

  try {
    // 1. 从 family_recipes 关联表分页获取全部菜谱ID（避免默认 20 条 / limit 截断）
    const pageSize = 100;
    let offset = 0;
    const familyRecipes = [];
    while (true) {
      const res = await db.collection('family_recipes')
        .where({
          family_id: familyId,
          deleted: false
        })
        .orderBy('order', 'asc')
        .skip(offset)
        .limit(pageSize)
        .get();

      const batch = res.data || [];
      familyRecipes.push(...batch);

      if (batch.length < pageSize) break;
      offset += pageSize;
    }

    if (familyRecipes.length === 0) {
      return { code: 0, message: '无菜谱', data: [] };
    }

    const recipeIds = familyRecipes.map(fr => fr.recipe_id);

    // 2. 分批获取菜谱详情（防止 in 查询限制），各批并发查询
    const batchSize = 100; // 每批查询100个
    const batches = [];
    for (let i = 0; i < recipeIds.length; i += batchSize) {
      batches.push(recipeIds.slice(i, i + batchSize));
    }

    const batchResults = await Promise.all(
      batches.map(batchIds =>
        db.collection('recipes').where({ _id: db.command.in(batchIds) }).get()
      )
    );
    const allRecipes = batchResults.reduce((acc, res) => acc.concat(res.data || []), []);

    // 3. 按 family_recipes 的 order 顺序重排（in 查询不保证返回顺序）
    const recipeMap = new Map(allRecipes.map(r => [r._id, r]));
    const orderedRecipes = recipeIds.map(id => recipeMap.get(id)).filter(Boolean);

    return {
      code: 0,
      message: '获取成功',
      data: orderedRecipes
    };
  } catch (e) {
    return { code: 2, message: '数据库错误: ' + e.message };
  }
}; 