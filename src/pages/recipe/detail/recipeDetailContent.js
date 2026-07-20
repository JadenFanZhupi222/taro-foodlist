function meaningfulIngredients(ingredients) {
  if (!Array.isArray(ingredients)) return []
  return ingredients
    .map(ingredient => ({
      name: typeof ingredient?.name === 'string' ? ingredient.name.trim() : '',
      amount: typeof ingredient?.amount === 'string' ? ingredient.amount.trim() : ''
    }))
    .filter(ingredient => ingredient.name || ingredient.amount)
}

function meaningfulSteps(steps) {
  if (!Array.isArray(steps)) return []
  return steps
    .filter(step => typeof step === 'string')
    .map(step => step.trim())
    .filter(Boolean)
}

export { meaningfulIngredients, meaningfulSteps }
