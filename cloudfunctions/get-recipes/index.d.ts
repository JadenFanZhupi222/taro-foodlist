import { Recipe } from '../create-recipe/index.d';

interface Ingredient {
  name: string
  amount: string
}

interface GetRecipesEvent {
  familyId: string
}

interface GetRecipesResult {
  code: number // 0: 成功, 1: 参数错误, 2: 数据库错误
  message: string
  data?: Recipe[]
}

interface CloudFunctionContext {
  OPENID: string
  APPID: string
  UNIONID?: string
  ENV: string
}

declare function main(event: GetRecipesEvent, context: CloudFunctionContext): Promise<GetRecipesResult>

export { main, Recipe, Ingredient, GetRecipesEvent, GetRecipesResult } 