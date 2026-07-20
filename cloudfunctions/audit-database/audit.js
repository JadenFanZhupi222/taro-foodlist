function sortedUnique(values) {
  return [...new Set(values.filter(Boolean))].sort()
}

function auditFamilies(families) {
  const memberships = new Map()

  for (const family of families) {
    for (const openId of sortedUnique(family.members || [])) {
      const familyIds = memberships.get(openId) || []
      familyIds.push(family._id)
      memberships.set(openId, familyIds)
    }
  }

  const multiFamilyUsers = [...memberships.entries()]
    .map(([openId, familyIds]) => ({ openId, familyIds: sortedUnique(familyIds) }))
    .filter(item => item.familyIds.length > 1)
    .sort((a, b) => a.openId.localeCompare(b.openId))

  return { count: multiFamilyUsers.length, multiFamilyUsers }
}

function auditUsers(users, families) {
  const memberships = new Map()
  for (const family of families) {
    for (const openId of sortedUnique(family.members || [])) {
      const familyIds = memberships.get(openId) || []
      familyIds.push(family._id)
      memberships.set(openId, familyIds)
    }
  }

  const familyCacheMismatches = users
    .filter(user => user.openId)
    .map(user => ({
      openId: user.openId,
      cachedFamilyId: user.family_id || '',
      actualFamilyIds: sortedUnique(memberships.get(user.openId) || [])
    }))
    .filter(item => {
      const actual = item.actualFamilyIds.length === 1 ? item.actualFamilyIds[0] : ''
      return item.cachedFamilyId !== actual
    })
    .sort((a, b) => a.openId.localeCompare(b.openId))

  return { count: familyCacheMismatches.length, familyCacheMismatches }
}

function auditRecipeRelations(relations, recipes, families) {
  const recipeIds = new Set(recipes.map(recipe => recipe._id))
  const familyIds = new Set(families.map(family => family._id))
  const groups = new Map()

  for (const relation of relations.filter(item => item.deleted !== true)) {
    const key = `${relation.family_id}_${relation.recipe_id}`
    const ids = groups.get(key) || []
    ids.push(relation._id)
    groups.set(key, ids)
  }

  const duplicateRelations = [...groups.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([relationKey, relationIds]) => ({ relationKey, relationIds: sortedUnique(relationIds) }))
    .sort((a, b) => a.relationKey.localeCompare(b.relationKey))

  const orphanRelations = relations
    .map(relation => {
      const missing = []
      if (!familyIds.has(relation.family_id)) missing.push('family')
      if (!recipeIds.has(relation.recipe_id)) missing.push('recipe')
      return {
        relationId: relation._id,
        familyId: relation.family_id,
        recipeId: relation.recipe_id,
        missing,
        deleted: relation.deleted === true
      }
    })
    .filter(item => item.missing.length > 0)
    .sort((a, b) => a.relationId.localeCompare(b.relationId))

  return {
    count: duplicateRelations.length + orphanRelations.length,
    duplicateRelations,
    orphanRelations
  }
}

function auditMenus(menus, families) {
  const familyIds = new Set(families.map(family => family._id))
  const groups = new Map()

  for (const menu of menus) {
    const key = `${menu.family_id}_${menu.date}`
    const ids = groups.get(key) || []
    ids.push(menu._id)
    groups.set(key, ids)
  }

  const duplicateMenus = [...groups.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([menuKey, menuIds]) => ({ menuKey, menuIds: sortedUnique(menuIds) }))
    .sort((a, b) => a.menuKey.localeCompare(b.menuKey))

  const orphanMenus = menus
    .filter(menu => !familyIds.has(menu.family_id))
    .map(menu => ({ menuId: menu._id, familyId: menu.family_id, date: menu.date }))
    .sort((a, b) => a.menuId.localeCompare(b.menuId))

  return {
    count: duplicateMenus.length + orphanMenus.length,
    duplicateMenus,
    orphanMenus
  }
}

module.exports = { auditFamilies, auditUsers, auditRecipeRelations, auditMenus }
