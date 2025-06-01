interface Ingredient {
  name: string;
  amount: string;
}

interface Recipe {
  _id: string;
  name: string;
  type: string;
  image?: string;
  description?: string;
  steps?: string[];
  ingredients?: Ingredient[];
}

interface UpdateRecipeEvent {
  recipeId: string;
  recipe: Partial<Omit<Recipe, '_id'>>;
}
interface UpdateRecipeResult {
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

declare function main(event: UpdateRecipeEvent, context: CloudFunctionContext): Promise<UpdateRecipeResult>;

export { main, Recipe, Ingredient, UpdateRecipeEvent, UpdateRecipeResult }; 