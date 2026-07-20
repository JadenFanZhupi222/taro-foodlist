function hydrateTodayRecipes(menu, recipes, catalogStatus) {
  if (!menu) return []
  const terminal = catalogStatus === 'ready' || catalogStatus === 'failed'
  return menu.recipes.map(ref => {
    const recipe = recipes.find(item => item._id === ref.recipe_id)
    if (recipe) return { ...recipe, _id: recipe._id, order: ref.order, image: recipe.image || '' }
    if (!terminal) return null
    return {
      _id: ref.recipe_id,
      name: ref.name || (catalogStatus === 'ready' ? '食谱已移除' : '食谱信息暂不可用'),
      type: ref.type || '其他',
      image: '',
      order: ref.order,
      unavailable: true
    }
  }).filter(Boolean)
}

export { hydrateTodayRecipes }
