import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initialState'
import { fetchDailyMenus, createOrUpdateDailyMenu, removeRecipeFromMenu } from '@/thunks/dailyMenu/thunks'

const dailyMenuSlice = createSlice({
  name: 'dailyMenu',
  initialState,
  reducers: {
    setDailyMenus(state, action) {
      state.dailyMenus = action.payload
    },
    addDailyMenu(state, action) {
      state.dailyMenus.push(action.payload)
    },
    updateDailyMenu(state, action) {
      const idx = state.dailyMenus.findIndex(m => m._id === action.payload._id)
      if (idx !== -1) state.dailyMenus[idx] = action.payload
    },
    deleteDailyMenu(state, action) {
      state.dailyMenus = state.dailyMenus.filter(m => m._id !== action.payload)
    },
    clearDailyMenus(state) {
      state.dailyMenus = []
    },
    setSelectedRecipes(state, action) {
      state.selectedRecipes = action.payload
    },
    resetDailyMenu: () => initialState,
    removeSelectedRecipe(state, action) {
      state.selectedRecipes = state.selectedRecipes.filter(r => r._id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyMenus.pending, (state) => { state.fetchLoading = true })
      .addCase(fetchDailyMenus.fulfilled, (state) => { state.fetchLoading = false })
      .addCase(fetchDailyMenus.rejected, (state) => { state.fetchLoading = false })
      .addCase(createOrUpdateDailyMenu.pending, (state) => { state.createLoading = true })
      .addCase(createOrUpdateDailyMenu.fulfilled, (state) => { state.createLoading = false })
      .addCase(createOrUpdateDailyMenu.rejected, (state) => { state.createLoading = false })
      .addCase(removeRecipeFromMenu.pending, (state) => { state.removeLoading = true })
      .addCase(removeRecipeFromMenu.fulfilled, (state) => { state.removeLoading = false })
      .addCase(removeRecipeFromMenu.rejected, (state) => { state.removeLoading = false })
  }
})

export const {
  setDailyMenus,
  addDailyMenu,
  updateDailyMenu,
  deleteDailyMenu,
  clearDailyMenus,
  setSelectedRecipes,
  resetDailyMenu,
  removeSelectedRecipe
} = dailyMenuSlice.actions
export const dailyMenuReducer = dailyMenuSlice.reducer 