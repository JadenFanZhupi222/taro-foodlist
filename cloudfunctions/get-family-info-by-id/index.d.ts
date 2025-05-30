interface CloudFunctionEvent {
  familyId: string;
}

interface UserInfo {
  _id: string;
  openId: string;
  nickname: string;
  avatar: string;
  role?: 'owner' | 'member';
  family_id?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface FamilyInfo {
  _id: string;
  name: string;
  family_owner: string;
  members: string[];
  membersInfo: UserInfo[];
  createdAt: Date;
  updatedAt: Date;
}

interface CloudFunctionResult {
  code: number;
  data?: FamilyInfo | null;
  message?: string;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>; 