function getMenuKey(familyId, date) {
  return `${familyId}::${String(date).slice(0, 10)}`
}

function markMenuRevision(state, familyId, date) {
  state.menuRevision += 1
  state.menuRevisions[getMenuKey(familyId, date)] = state.menuRevision
  return state.menuRevision
}

function mergeBulkMenus(state, familyId, incomingMenus, bulkRevision) {
  const isProtected = date => (state.menuRevisions[getMenuKey(familyId, date)] || 0) > bulkRevision
  const otherFamilies = state.dailyMenus.filter(menu => menu.family_id !== familyId)
  const protectedMenus = state.dailyMenus.filter(
    menu => menu.family_id === familyId && isProtected(menu.date)
  )
  const refreshedMenus = incomingMenus.filter(menu => !isProtected(menu.date))
  state.dailyMenus = [...otherFamilies, ...protectedMenus, ...refreshedMenus]
}

function removeRecipeForFamilyDate(menus, familyId, date, recipeId) {
  const menu = menus.find(
    item => item.family_id === familyId && String(item.date).slice(0, 10) === date
  )
  if (!menu) return false
  menu.recipes = menu.recipes.filter(recipe => recipe.recipe_id !== recipeId)
  return true
}

module.exports = { getMenuKey, markMenuRevision, mergeBulkMenus, removeRecipeForFamilyDate }
