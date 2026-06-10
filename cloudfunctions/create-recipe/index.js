const cloud = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  const { recipe } = event;
  if (!recipe || !recipe.name || !recipe.type) {
    return { code: 1, message: '参数缺失' };
  }

  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
  const db = app.database();

  // 鉴权：从可信上下文取 openId，按家庭成员关系授权（忽略客户端传入的 familyId）
  const wxContext = app.auth().getUserInfo();
  const openId = wxContext.openId || wxContext.OPENID;
  if (!openId) return { code: 401, message: '未登录' };
  const myFamilyRes = await db.collection('family').where({ members: openId }).get();
  const myFamily = myFamilyRes.data[0];
  if (!myFamily) return { code: 403, message: '未加入家庭' };
  const familyId = myFamily._id;

  try {
    // 1. 新增菜谱（created_by 以服务端身份为准）
    const addRes = await db.collection('recipes').add({ ...recipe, created_by: openId });
    const recipeId = addRes.id || addRes._id;
    if (!recipeId) {
      return { code: 2, message: '菜谱创建失败' };
    }

    // 2. 创建家庭菜谱关联记录
    await db.collection('family_recipes').add({
      family_id: familyId,
      recipe_id: recipeId,
      order: Date.now(), // 使用时间戳作为排序，新菜谱排在最后
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
      createdby: openId,
      owner: openId,
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