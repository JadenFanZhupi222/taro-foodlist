import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initialState'
import { fetchRecipes, fetchRecipeById, createRecipe, updateRecipeById, deleteRecipeById } from '@/thunks/recipe/thunks'
import detailRequestModule = require('./detailRequest')
import catalogRequestModule = require('./catalogRequest')

const { startDetailRequest, fulfillDetailRequest, rejectDetailRequest } = detailRequestModule
const { startCatalogRequest, fulfillCatalogRequest, rejectCatalogRequest } = catalogRequestModule

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
      .addCase(fetchRecipes.pending, (state, action) => {
        startCatalogRequest(state, action.meta.arg, action.meta.requestId)
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        fulfillCatalogRequest(state, action.meta.arg, action.meta.requestId, action.payload)
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        rejectCatalogRequest(state, action.meta.arg, action.meta.requestId)
      })
      .addCase(fetchRecipeById.pending, (state, action) => {
        startDetailRequest(state, action.meta.arg, action.meta.requestId)
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        fulfillDetailRequest(state, action.meta.arg, action.meta.requestId, action.payload)
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        rejectDetailRequest(state, action.meta.arg, action.meta.requestId)
      })
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
