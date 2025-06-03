import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initialState'
import { fetchDailyMenus, createDailyMenu, updateDailyMenuById, deleteDailyMenuById } from '@/thunks/dailyMenu/thunks'

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
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyMenus.pending, (state) => { state.fetchLoading = true })
      .addCase(fetchDailyMenus.fulfilled, (state) => { state.fetchLoading = false })
      .addCase(fetchDailyMenus.rejected, (state) => { state.fetchLoading = false })
      .addCase(createDailyMenu.pending, (state) => { state.createLoading = true })
      .addCase(createDailyMenu.fulfilled, (state) => { state.createLoading = false })
      .addCase(createDailyMenu.rejected, (state) => { state.createLoading = false })
      .addCase(updateDailyMenuById.pending, (state) => { state.updateLoading = true })
      .addCase(updateDailyMenuById.fulfilled, (state) => { state.updateLoading = false })
      .addCase(updateDailyMenuById.rejected, (state) => { state.updateLoading = false })
      .addCase(deleteDailyMenuById.pending, (state) => { state.deleteLoading = true })
      .addCase(deleteDailyMenuById.fulfilled, (state) => { state.deleteLoading = false })
      .addCase(deleteDailyMenuById.rejected, (state) => { state.deleteLoading = false })
  }
})

export const {
  setDailyMenus,
  addDailyMenu,
  updateDailyMenu,
  deleteDailyMenu,
  clearDailyMenus
} = dailyMenuSlice.actions
export const dailyMenuReducer = dailyMenuSlice.reducer 