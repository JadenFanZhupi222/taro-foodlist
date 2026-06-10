const cloud = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  const { recipeId } = event;
  if (!recipeId) {
    return { code: 1, message: '参数缺失' };
  }

  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
  const db = app.database();

  // 鉴权：从可信上下文取 openId，按家庭成员关系授权
  const wxContext = app.auth().getUserInfo();
  const openId = wxContext.openId || wxContext.OPENID;
  if (!openId) return { code: 401, message: '未登录' };
  const myFamilyRes = await db.collection('family').where({ members: openId }).get();
  const myFamily = myFamilyRes.data[0];
  if (!myFamily) return { code: 403, message: '未加入家庭' };
  const familyId = myFamily._id;

  try {
    // 0. 校验该菜谱确实属于本家庭，避免越权删除
    const relRes = await db.collection('family_recipes')
      .where({ family_id: familyId, recipe_id: recipeId, deleted: false })
      .get();
    if (!relRes.data || relRes.data.length === 0) {
      return { code: 3, message: '无权删除该菜谱' };
    }

    // 仅软删除本家庭的关联记录；菜谱本体可被其他家庭共享，故不动 recipes.deleted
    await db.collection('family_recipes')
      .where({
        family_id: familyId,
        recipe_id: recipeId
      })
      .update({
        deleted: true,
        updatedAt: db.serverDate()
      });

    return { code: 0, message: '删除成功' };
  } catch (e) {
    return { code: 2, message: '数据库错误: ' + e.message };
  }
}; 