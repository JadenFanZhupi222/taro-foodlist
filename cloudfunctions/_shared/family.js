function familyError(code, message) {
  const error = new Error(message)
  error.code = code
  return error
}

function resolveCurrentFamily(families, targetFamilyId) {
  if (!families || families.length === 0) return null
  if (families.length > 1) {
    throw familyError('MULTIPLE_FAMILIES', '用户同时属于多个家庭')
  }

  const family = families[0]
  if (targetFamilyId && family._id !== targetFamilyId) {
    throw familyError('FAMILY_CONFLICT', '用户已加入其他家庭')
  }
  return family
}

function nextFamilyOwner(members, leavingOpenId) {
  return (members || []).find(openId => openId !== leavingOpenId) || null
}

function makeRelationKey(familyId, recipeId) {
  if (!familyId || !recipeId) throw new TypeError('familyId and recipeId are required')
  return `${encodeURIComponent(familyId)}_${encodeURIComponent(recipeId)}`
}

module.exports = { resolveCurrentFamily, nextFamilyOwner, makeRelationKey }
