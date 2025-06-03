import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initialState'
import { fetchRecipes, createRecipe, updateRecipeById, deleteRecipeById } from '@/thunks/recipe/thunks'

const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    setRecipes(state, action) {
      state.recipes = action.payload
    },
    setComments(state, action) {
      state.comments = action.payload
    },
    addRecipe(state, action) {
      state.recipes.push(action.payload)
    },
    updateRecipe(state, action) {
      const idx = state.recipes.findIndex(r => r._id === action.payload._id)
      if (idx !== -1) state.recipes[idx] = action.payload
    },
    updateRecipeInStore(state, action) {
      const { recipeId, recipe } = action.payload
      const idx = state.recipes.findIndex(r => r._id === recipeId)
      if (idx !== -1) state.recipes[idx] = { ...state.recipes[idx], ...recipe }
    },
    deleteRecipe(state, action) {
      state.recipes = state.recipes.filter(r => r._id !== action.payload)
    },
    addComment(state, action) {
      state.comments.push(action.payload)
    },
    clearRecipes(state) {
      state.recipes = []
      state.comments = []
    },
    resetRecipes: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => { state.fetchLoading = true })
      .addCase(fetchRecipes.fulfilled, (state) => { state.fetchLoading = false })
      .addCase(fetchRecipes.rejected, (state) => { state.fetchLoading = false })
      .addCase(createRecipe.pending, (state) => { state.createLoading = true })
      .addCase(createRecipe.fulfilled, (state) => { state.createLoading = false })
      .addCase(createRecipe.rejected, (state) => { state.createLoading = false })
      .addCase(updateRecipeById.pending, (state) => { state.updateLoading = true })
      .addCase(updateRecipeById.fulfilled, (state) => { state.updateLoading = false })
      .addCase(updateRecipeById.rejected, (state) => { state.updateLoading = false })
      .addCase(deleteRecipeById.pending, (state) => { state.deleteLoading = true })
      .addCase(deleteRecipeById.fulfilled, (state) => { state.deleteLoading = false })
      .addCase(deleteRecipeById.rejected, (state) => { state.deleteLoading = false })
  }
})

export const { 
  setRecipes,
  setComments, 
  addRecipe, 
  updateRecipe, 
  updateRecipeInStore,
  deleteRecipe, 
  addComment, 
  clearRecipes,
  resetRecipes
} = recipeSlice.actions
export const recipeReducer = recipeSlice.reducer 