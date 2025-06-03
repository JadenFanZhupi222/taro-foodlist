interface CloudFunctionEvent {
  familyId: string
  date: string
}

interface CloudFunctionContext {
  OPENID: string
  APPID: string
  UNIONID?: string
  ENV: string
}

interface DeleteDailyMenuResult {
  code: number
  message: string
}

declare function main(event: CloudFunctionEvent, context: CloudFunctionContext): Promise<DeleteDailyMenuResult>

export { main, DeleteDailyMenuResult } 