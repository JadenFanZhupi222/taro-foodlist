function getTodayAddAction({ userId, familyId }) {
  if (!userId) return 'login'
  if (!familyId) return 'family'
  return 'add'
}

function classifyTodayState({ userId, familyId, requestStatus, menu, resolvedRecipeCount = 0 }) {
  const access = getTodayAddAction({ userId, familyId })
  if (access !== 'add') return access
  if (requestStatus === 'failed') return 'failed'
  if (menu?.recipes?.length === 0 || (!menu && requestStatus === 'empty')) return 'empty'
  if (!menu || (menu.recipes.length > 0 && resolvedRecipeCount === 0)) return 'resolving'
  return 'ready'
}

module.exports = { classifyTodayState, getTodayAddAction }
