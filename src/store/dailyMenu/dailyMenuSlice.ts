import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from './initialState'
import { fetchDailyMenus, createOrUpdateDailyMenu, removeRecipeFromMenu, fetchDailyMenuByDate } from '@/thunks/dailyMenu/thunks'
import { DailyMenu, DailyMenuRecipeItem } from './types'
import { isSameDay } from '@/utils/date'

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
    addEmptyDate(state, action: PayloadAction<string>) {
      if (!state.emptyDates.includes(action.payload)) {
        state.emptyDates.push(action.payload)
      }
    },
    deleteDailyMenuByDate(state, action: PayloadAction<string>) {
      state.dailyMenus = state.dailyMenus.filter(m => m.date !== action.payload)
    },
    // 用权威数据替换同一日期的菜单（含清理乐观更新产生的临时菜单），保证同日期不重复
    upsertDailyMenuByDate(state, action: PayloadAction<DailyMenu>) {
      const menu = action.payload
      state.dailyMenus = state.dailyMenus.filter(m => !isSameDay(m.date, menu.date))
      state.dailyMenus.push(menu)
      state.emptyDates = state.emptyDates.filter(d => d !== menu.date)
    },
    // 乐观添加菜品：本地立即可见；纯 UI 状态，不写服务端
    optimisticAddRecipe(
      state,
      action: PayloadAction<{ date: string; familyId: string; item: DailyMenuRecipeItem }>
    ) {
      const { date, familyId, item } = action.payload
      state.emptyDates = state.emptyDates.filter(d => d !== date)
      const menu = state.dailyMenus.find(m => isSameDay(m.date, date))
      if (menu) {
        if (!menu.recipes.some(r => r.recipe_id === item.recipe_id)) {
          menu.recipes.push(item)
        }
      } else {
        state.dailyMenus.push({
          _id: `temp-${date}`,
          family_id: familyId,
          date,
          recipes: [item],
          _openid: '',
          createdAt: 0,
          updatedAt: 0
        })
      }
    },
    // 乐观移除菜品：本地立即移除；纯 UI 状态，不写服务端
    optimisticRemoveRecipe(
      state,
      action: PayloadAction<{ date: string; recipeId: string }>
    ) {
      const menu = state.dailyMenus.find(m => isSameDay(m.date, action.payload.date))
      if (menu) {
        menu.recipes = menu.recipes.filter(r => r.recipe_id !== action.payload.recipeId)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyMenus.pending, (state) => { state.fetchLoading = true })
      .addCase(fetchDailyMenus.fulfilled, (state) => { state.fetchLoading = false })
      .addCase(fetchDailyMenus.rejected, (state) => { state.fetchLoading = false })
      .addCase(fetchDailyMenuByDate.pending, (state) => { state.fetchDailyLoading = true })
      .addCase(fetchDailyMenuByDate.fulfilled, (state) => { state.fetchDailyLoading = false })
      .addCase(fetchDailyMenuByDate.rejected, (state) => { state.fetchDailyLoading = false })
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
  removeSelectedRecipe,
  addEmptyDate,
  deleteDailyMenuByDate,
  upsertDailyMenuByDate,
  optimisticAddRecipe,
  optimisticRemoveRecipe
} = dailyMenuSlice.actions
export const dailyMenuReducer = dailyMenuSlice.reducer 