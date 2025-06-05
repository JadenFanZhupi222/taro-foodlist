import { RootState } from '@/store'
import { createSelector } from 'reselect'

export const selectRecipes = createSelector(
  (state: RootState) => state.recipe.recipes,
  (recipes) => recipes.filter(r => !r.deleted)
)
export const selectComments = (state: RootState) => state.recipe.comments
export const selectRecipeById = (id: string) => (state: RootState) =>
  state.recipe.recipes.find(r => r._id === id)
export const selectRecipesByType = (type: string) => createSelector(
  (state: RootState) => state.recipe.recipes,
  (recipes) => recipes.filter(recipe => recipe.type === type)
)
export const selectRecipeLoading = createSelector(
  (state: RootState) => state.recipe,
  (recipe) => ({
    fetchLoading: recipe.fetchLoading,
    createLoading: recipe.createLoading,
    updateLoading: recipe.updateLoading,
    deleteLoading: recipe.deleteLoading
  })
) 