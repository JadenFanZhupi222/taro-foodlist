import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from './initialState'
import { fetchDailyMenus, createOrUpdateDailyMenu, removeRecipeFromMenu, fetchDailyMenuByDate } from '@/thunks/dailyMenu/thunks'
import { DailyMenu, DailyMenuRecipeItem } from './types'
import { isSameDay } from '@/utils/date'
import dateRequestModule = require('./dateRequest')
import menuMergeModule = require('./menuMerge')

const {
  startDateRequest,
  fulfillDateRequest,
  rejectDateRequest,
  startFamilyRequest,
  fulfillFamilyRequest,
  rejectFamilyRequest
} = dateRequestModule
const { markMenuRevision, mergeBulkMenus, removeRecipeForFamilyDate } = menuMergeModule

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
    // 用权威数据替换同一日期的菜单（含清理乐观更新产生的临时菜单），保证同日期不重复
    upsertDailyMenuByDate(state, action: PayloadAction<DailyMenu>) {
      const menu = action.payload
      markMenuRevision(state, menu.family_id, menu.date)
      state.dailyMenus = state.dailyMenus.filter(m => m.family_id !== menu.family_id || !isSameDay(m.date, menu.date))
      state.dailyMenus.push(menu)
    },
    // 乐观添加菜品：本地立即可见；纯 UI 状态，不写服务端
    optimisticAddRecipe(
      state,
      action: PayloadAction<{ date: string; familyId: string; item: DailyMenuRecipeItem }>
    ) {
      const { date, familyId, item } = action.payload
      markMenuRevision(state, familyId, date)
      const menu = state.dailyMenus.find(m => m.family_id === familyId && isSameDay(m.date, date))
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
      action: PayloadAction<{ date: string; familyId: string; recipeId: string }>
    ) {
      const { familyId, date, recipeId } = action.payload
      markMenuRevision(state, familyId, date)
      removeRecipeForFamilyDate(state.dailyMenus, familyId, date, recipeId)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyMenus.pending, (state, action) => {
        state.fetchLoading = true
        startFamilyRequest(state, action.meta.arg.familyId, action.meta.requestId)
      })
      .addCase(fetchDailyMenus.fulfilled, (state, action) => {
        state.fetchLoading = false
        const familyId = action.meta.arg.familyId
        const bulkRevision = state.familyRequests[familyId]?.revision || 0
        if (!fulfillFamilyRequest(state, action.meta.arg.familyId, action.meta.requestId)) return
        mergeBulkMenus(state, familyId, action.payload.menus, bulkRevision)
      })
      .addCase(fetchDailyMenus.rejected, (state, action) => {
        state.fetchLoading = false
        rejectFamilyRequest(state, action.meta.arg.familyId, action.meta.requestId)
      })
      .addCase(fetchDailyMenuByDate.pending, (state, action) => {
        state.fetchDailyLoading = true
        markMenuRevision(state, action.meta.arg.familyId, action.meta.arg.date)
        startDateRequest(state, action.meta.arg.familyId, action.meta.arg.date, action.meta.requestId)
      })
      .addCase(fetchDailyMenuByDate.fulfilled, (state, action) => {
        state.fetchDailyLoading = false
        const familyId = action.meta.arg.familyId
        const date = action.meta.arg.date
        if (!fulfillDateRequest(state, familyId, date, action.meta.requestId, action.payload)) return
        state.dailyMenus = state.dailyMenus.filter(m => m.family_id !== familyId || !isSameDay(m.date, date))
        if (action.payload) state.dailyMenus.push(action.payload)
      })
      .addCase(fetchDailyMenuByDate.rejected, (state, action) => {
        state.fetchDailyLoading = false
        rejectDateRequest(state, action.meta.arg.familyId, action.meta.arg.date, action.meta.requestId, action.error.message)
      })
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
  upsertDailyMenuByDate,
  optimisticAddRecipe,
  optimisticRemoveRecipe
} = dailyMenuSlice.actions
export const dailyMenuReducer = dailyMenuSlice.reducer
