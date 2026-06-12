const cloud = require('@cloudbase/node-sdk')

const getShanghaiDateKey = (date = new Date()) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

/**
 * 重排某日菜单内菜品顺序
 * event: { menuId: string, recipeIds: string[] }  // recipeIds 为期望的新顺序
 */
exports.main = async (event, context) => {
  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
  const db = app.database()
  const { menuId, recipeIds } = event

  if (!menuId || !Array.isArray(recipeIds)) {
    return { code: 1, message: 'menuId 和 recipeIds 不能为空' }
  }

  try {
    const menuRes = await db.collection('daily_menu').doc(menuId).get()
    const menu = menuRes.data[0]
    if (!menu) {
      return { code: 2, message: '未找到菜单' }
    }

    // 不允许改历史日期
    const todayStr = getShanghaiDateKey()
    if (menu.date < todayStr) {
      return { code: 2, message: '不能修改历史日期菜单' }
    }

    const existing = menu.recipes || []
    // 以 recipe_id 建索引，保留原有项的全部字段
    const byId = new Map(existing.map(r => [r.recipe_id, r]))

    // 1. 按传入顺序重排（仅认已存在的项）
    const ordered = []
    for (const id of recipeIds) {
      if (byId.has(id)) {
        ordered.push(byId.get(id))
        byId.delete(id)
      }
    }
    // 2. 兜底：任何未出现在 recipeIds 里的原有项，原样追加到末尾——绝不丢菜品
    for (const leftover of byId.values()) {
      ordered.push(leftover)
    }

    // 3. 重新分配连续 order
    const reordered = ordered.map((r, i) => ({ ...r, order: i + 1 }))

    await db.collection('daily_menu').doc(menuId).update({
      recipes: reordered,
      updatedAt: new Date()
    })

    return { code: 0, message: '排序已保存', data: { ...menu, recipes: reordered } }
  } catch (error) {
    return { code: -1, message: error.message }
  }
}
