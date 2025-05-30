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

interface CreateFamilyResult {
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
  familyName: string
}

declare function main(event: CloudFunctionEvent, context: CloudFunctionContext): Promise<CreateFamilyResult>

export { main, Family, FamilyMember, CreateFamilyResult } 