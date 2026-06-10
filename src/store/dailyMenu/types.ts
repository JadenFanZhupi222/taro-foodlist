import { Recipe } from "../recipe/types"

export interface DailyMenuRecipeItem {
  recipe_id: string
  order: number
  // 下单时的菜名/类型快照，菜谱被删除或改名后用于回退展示，保住历史
  name?: string
  type?: string
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