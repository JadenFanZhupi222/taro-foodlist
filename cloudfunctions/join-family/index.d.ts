// join-family 云函数类型声明

interface JoinFamilyEvent {
  familyId: string;
  openId: string;
}

interface User {
  _id: string;
  openId: string;
  nickname: string;
  avatar: string;
  family_id?: string;
  role: 'owner' | 'member';
  createdAt: number;
  updatedAt: number;
}

interface Family {
  _id: string;
  name: string;
  family_owner: string;
  members: string[];
  membersInfo?: User[];
  createdAt: Date;
  updatedAt: Date;
}

interface JoinFamilyResult {
  code: number;
  data?: Family & { membersInfo: User[] };
  message?: string;
}

interface CloudFunctionContext {
  OPENID: string
  APPID: string
  UNIONID?: string
  ENV: string
}

declare function main(event: JoinFamilyEvent, context: CloudFunctionContext): Promise<JoinFamilyResult>

export { main, Family, User, JoinFamilyResult } 