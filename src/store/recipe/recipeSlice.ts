import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initialState'

const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    setRecipes(state, action) {
      state.recipes = action.payload
    },
    setCurrentRecipe(state, action) {
      state.currentRecipe = action.payload
    },
    setComments(state, action) {
      state.comments = action.payload
    },
    addRecipe(state, action) {
      state.recipes.push(action.payload)
    },
    updateRecipe(state, action) {
      const idx = state.recipes.findIndex(r => r.id === action.payload.id)
      if (idx !== -1) state.recipes[idx] = action.payload
    },
    deleteRecipe(state, action) {
      state.recipes = state.recipes.filter(r => r.id !== action.payload)
    },
    addComment(state, action) {
      state.comments.push(action.payload)
    },
    clearRecipes(state) {
      state.recipes = []
      state.currentRecipe = null
      state.comments = []
    }
  }
})

export const { setRecipes, setCurrentRecipe, setComments, addRecipe, updateRecipe, deleteRecipe, addComment, clearRecipes } = recipeSlice.actions
export const recipeReducer = recipeSlice.reducer 