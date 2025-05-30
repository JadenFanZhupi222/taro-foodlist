interface FamilyMember {
  userId: string
  role: 'owner' | 'member'
  permissions: string[]
}

interface Family {
  _id: string
  name: string
  family_owner: string
  members: FamilyMember[]
  createdAt: Date
  updatedAt: Date
}

interface GetFamilyInfoResult {
  code: number
  data: Family | null
  message: string
}

interface CloudFunctionContext {
  OPENID: string
  APPID: string
  UNIONID?: string
  ENV: string
}

interface CloudFunctionEvent {
  // 可以添加事件参数的类型定义
}

declare function main(event: CloudFunctionEvent, context: CloudFunctionContext): Promise<GetFamilyInfoResult>

export { main, Family, FamilyMember, GetFamilyInfoResult }