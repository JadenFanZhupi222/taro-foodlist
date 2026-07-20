import { DailyMenuState } from './types'

export const initialState: DailyMenuState = {
  dailyMenus: [],
  fetchLoading: false,
  fetchDailyLoading: false,
  createLoading: false,
  createPendingCount: 0,
  updateLoading: false,
  removeLoading: false,
  removePendingCount: 0,
  selectedRecipes: [],
  dateRequests: {},
  familyRequests: {},
  menuRevision: 0,
  menuRevisions: {}
}
