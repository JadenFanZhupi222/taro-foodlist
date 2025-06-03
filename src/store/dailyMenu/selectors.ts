import { RootState } from '../index'

export const selectDailyMenus = (state: RootState) => state.dailyMenu.dailyMenus
export const selectDailyMenuById = (id: string) => (state: RootState) =>
  state.dailyMenu.dailyMenus.find(m => m._id === id)
export const selectDailyMenuLoading = (state: RootState) => ({
  fetchLoading: state.dailyMenu.fetchLoading,
  createLoading: state.dailyMenu.createLoading,
  updateLoading: state.dailyMenu.updateLoading,
  removeLoading: state.dailyMenu.removeLoading
})
export const selectSelectedRecipes = (state: RootState) => state.dailyMenu.selectedRecipes 