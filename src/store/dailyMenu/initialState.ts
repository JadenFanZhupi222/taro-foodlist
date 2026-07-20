import { DailyMenuState } from './types'

export const initialState: DailyMenuState = {
  dailyMenus: [],
  fetchLoading: false,
  fetchDailyLoading: false,
  createLoading: false,
  createPendingRequests: {},
  updateLoading: false,
  removeLoading: false,
  removePendingRequests: {},
  selectedRecipes: [],
  dateRequests: {},
  familyRequests: {},
  menuRevision: 0,
  menuRevisions: {}
}
