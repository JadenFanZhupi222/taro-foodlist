function getTodayAddAction({ userId, familyId }) {
  if (!userId) return 'login'
  if (!familyId) return 'family'
  return 'add'
}

function classifyTodayState({ userId, familyId, requestStatus, menu, totalRecipeCount, resolvedRecipeCount = 0 }) {
  const access = getTodayAddAction({ userId, familyId })
  if (access !== 'add') return access
  if (requestStatus === 'failed') return 'failed'
  if (menu?.recipes?.length === 0 || (!menu && requestStatus === 'empty')) return 'empty'
  const expectedRecipeCount = totalRecipeCount ?? menu?.recipes?.length ?? 0
  if (!menu || resolvedRecipeCount < expectedRecipeCount) return 'resolving'
  return 'ready'
}

function findFamilyMenu(menus, familyId, date) {
  if (!familyId) return undefined
  return menus.find(menu => menu.family_id === familyId && String(menu.date).slice(0, 10) === date)
}

function shouldFetchDate({ familyId, menu, requestStatus }) {
  return Boolean(familyId && !menu && requestStatus == null)
}

export { classifyTodayState, getTodayAddAction, findFamilyMenu, shouldFetchDate }
