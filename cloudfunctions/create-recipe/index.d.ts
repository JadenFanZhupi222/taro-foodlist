interface Ingredient {
  name: string;
  amount: string;
}

interface Recipe {
  _id?: string;
  name: string;
  type: string;
  image?: string;
  description?: string;
  steps?: string[];
  ingredients?: Ingredient[];
}

interface CreateRecipeEvent {
  familyId: string;
  recipe: Omit<Recipe, '_id'>;
}

interface CreateRecipeResult {
  code: number; // 0: 成功, 1: 参数错误, 2: 数据库错误
  message: string;
  data?: Recipe;
}

interface CloudFunctionContext {
  OPENID: string;
  APPID: string;
  UNIONID?: string;
  ENV: string;
}

declare function main(event: CreateRecipeEvent, context: CloudFunctionContext): Promise<CreateRecipeResult>

export { main, Recipe, Ingredient, CreateRecipeEvent, CreateRecipeResult } 