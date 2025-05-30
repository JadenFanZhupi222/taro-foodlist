

interface CloudFunctionEvent {
  code?: string; // 微信登录临时凭证
  [key: string]: any; // 其他可能的参数
}

interface User {
  _id?: string;
  openId: string;
  appId: string;
  unionId: string;
  nickName: string;
  avatarUrl: string;
  createTime?: Date;
}

interface CloudFunctionResult {
  success: boolean;
  data?: User;
  message?: string;
  error?: string;
  errorDetails?: {
    code?: string;
    stack?: string;
  };
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;

