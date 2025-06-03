export interface DailyMenuRecipeItem {
  recipeId: string
  order: number
}

export interface DailyMenu {
  _id: string
  family_id: string
  date: string
  recipes: DailyMenuRecipeItem[]
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface DailyMenuState {
  dailyMenus: DailyMenu[]
  fetchLoading: boolean
  createLoading: boolean
  updateLoading: boolean
  deleteLoading: boolean
} 