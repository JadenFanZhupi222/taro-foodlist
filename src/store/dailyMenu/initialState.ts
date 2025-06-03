import { DailyMenuState } from './types'

export const initialState: DailyMenuState = {
  dailyMenus: [],
  fetchLoading: false,
  createLoading: false,
  updateLoading: false,
  removeLoading: false,
  selectedRecipes: []
} 