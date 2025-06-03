interface CloudFunctionEvent {
  familyId: string
  date: string
}

interface DailyMenuRecipeItem {
  recipeId: string
  order: number
}

interface DailyMenu {
  _id: string
  family_id: string
  date: string
  recipes: DailyMenuRecipeItem[]
  createdBy: string
  createdAt: number
  updatedAt: number
}

interface CloudFunctionResult {
  code: number
  message: string
  data?: DailyMenu | null
}

declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>

export { main, DailyMenu, DailyMenuRecipeItem, CloudFunctionResult } 