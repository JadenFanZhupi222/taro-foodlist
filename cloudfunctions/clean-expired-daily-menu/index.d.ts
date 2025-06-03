interface CleanExpiredDailyMenuResult {
  code: number
  message: string
  deleted: number
}

interface CloudFunctionContext {
  OPENID: string
  APPID: string
  UNIONID?: string
  ENV: string
}

declare function main(event: any, context: CloudFunctionContext): Promise<CleanExpiredDailyMenuResult>

export { main, CleanExpiredDailyMenuResult } 