import { RootState } from '@/store'
import { createSelector } from 'reselect'

export const selectDailyMenus = (state: RootState) => state.dailyMenu.dailyMenus

export const selectDailyMenuById = (id: string) => createSelector(
  (state: RootState) => state.dailyMenu.dailyMenus,
  (dailyMenus) => dailyMenus.find(m => m._id === id)
)

export const selectDailyMenuLoading = createSelector(
  (state: RootState) => state.dailyMenu,
  (dailyMenu) => ({
    fetchLoading: dailyMenu.fetchLoading,
    fetchDailyLoading: dailyMenu.fetchDailyLoading,
    createLoading: dailyMenu.createLoading,
    updateLoading: dailyMenu.updateLoading,
    removeLoading: dailyMenu.removeLoading
  })
)

export const selectSelectedRecipes = (state: RootState) => state.dailyMenu.selectedRecipes
export const selectEmptyDates = (state: RootState) => state.dailyMenu.emptyDates 