interface DeleteRecipeEvent {
  familyId: string;
  recipeId: string;
}
interface DeleteRecipeResult {
  code: number; // 0: 成功, 1: 参数错误, 2: 数据库错误
  message: string;
}

interface CloudFunctionContext {
  OPENID: string;
  APPID: string;
  UNIONID?: string;
  ENV: string;
}

declare function main(event: DeleteRecipeEvent, context: CloudFunctionContext): Promise<DeleteRecipeResult>;

export { main, DeleteRecipeEvent, DeleteRecipeResult }; 