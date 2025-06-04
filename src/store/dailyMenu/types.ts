import { Recipe } from "../recipe/types"

export interface DailyMenuRecipeItem {
  recipe_id: string
  order: number
}

export interface DailyMenu {
  _id: string
  family_id: string
  date: string
  recipes: DailyMenuRecipeItem[]
  _openid: string // CreatedBy
  createdAt: number
  updatedAt: number
}

export interface DailyMenuState {
  dailyMenus: DailyMenu[]
  fetchLoading: boolean
  fetchDailyLoading: boolean
  createLoading: boolean
  updateLoading: boolean
  removeLoading: boolean
  selectedRecipes: Recipe[]
  emptyDates: string[]
} 