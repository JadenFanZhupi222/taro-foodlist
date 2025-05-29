import { RootState } from '../index'

export const selectRecipes = (state: RootState) => state.recipe.recipes
export const selectCurrentRecipe = (state: RootState) => state.recipe.currentRecipe
export const selectComments = (state: RootState) => state.recipe.comments
export const selectRecipeById = (state: RootState, recipeId: string) =>
  state.recipe.recipes.find(recipe => recipe.id === recipeId)
export const selectRecipesByType = (state: RootState, type: string) =>
  state.recipe.recipes.filter(recipe => recipe.type === type) 