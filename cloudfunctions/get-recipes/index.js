const cloud = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
  const db = app.database();

  // 鉴权：从可信上下文取 openId，按家庭成员关系授权（忽略客户端传入的 familyId）
  const wxContext = app.auth().getUserInfo();
  const openId = wxContext.openId || wxContext.OPENID;
  if (!openId) return { code: 401, message: '未登录', data: [] };
  const myFamilyRes = await db.collection('family').where({ members: openId }).get();
  const myFamily = myFamilyRes.data[0];
  if (!myFamily) return { code: 403, message: '未加入家庭', data: [] };
  const familyId = myFamily._id;

  try {
    // 1. 从 family_recipes 关联表获取菜谱ID（增加 limit 避免默认限制）
    const familyRecipesRes = await db.collection('family_recipes')
      .where({
        family_id: familyId,
        deleted: false
      })
      .orderBy('order', 'asc')
      .limit(1000) // 增加限制数量
      .get();

    if (!familyRecipesRes.data || familyRecipesRes.data.length === 0) {
      return { code: 0, message: '无菜谱', data: [] };
    }

    const recipeIds = familyRecipesRes.data.map(fr => fr.recipe_id);

    // 2. 分批获取菜谱详情（防止 in 查询限制）
    let allRecipes = [];
    const batchSize = 100; // 每批查询100个
    
    for (let i = 0; i < recipeIds.length; i += batchSize) {
      const batchIds = recipeIds.slice(i, i + batchSize);
      const recipesRes = await db.collection('recipes').where({
        _id: db.command.in(batchIds)
      }).get();
      
      allRecipes = allRecipes.concat(recipesRes.data || []);
    }

    return {
      code: 0,
      message: '获取成功',
      data: allRecipes
    };
  } catch (e) {
    return { code: 2, message: '数据库错误: ' + e.message };
  }
}; 