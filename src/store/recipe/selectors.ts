import { RootState } from '../index'

export const selectRecipes = (state: RootState) => state.recipe.recipes
export const selectCurrentRecipe = (state: RootState) => state.recipe.currentRecipe
export const selectComments = (state: RootState) => state.recipe.comments
export const selectRecipeById = (state: RootState, recipeId: string) =>
  state.recipe.recipes.find(recipe => recipe._id === recipeId)
export const selectRecipesByType = (state: RootState, type: string) =>
  state.recipe.recipes.filter(recipe => recipe.type === type)
export const selectRecipeLoading = (state: RootState) => ({
  fetchLoading: state.recipe.fetchLoading,
  createLoading: state.recipe.createLoading,
  updateLoading: state.recipe.updateLoading,
  deleteLoading: state.recipe.deleteLoading
}) 