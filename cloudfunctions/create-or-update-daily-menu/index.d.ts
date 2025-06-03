interface RecipeItem {
  recipeId: string
  order: number
}

interface DailyMenu {
  _id?: string
  family_id: string
  date: string
  recipes: RecipeItem[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface CreateOrUpdateDailyMenuResult {
  code: number
  message: string
  data?: DailyMenu
}

interface CloudFunctionEvent {
  familyId: string
  date: string
  recipe: RecipeItem
  userId: string
}

interface CloudFunctionContext {
  OPENID: string
  APPID: string
  UNIONID?: string
  ENV: string
}

declare function main(event: CloudFunctionEvent, context: CloudFunctionContext): Promise<CreateOrUpdateDailyMenuResult>

export { main, DailyMenu, RecipeItem, CreateOrUpdateDailyMenuResult } 