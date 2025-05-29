export interface User {
  _id?: string;
  openId: string;
  appId: string;
  unionId: string;
  nickname: string;
  avatar: string;
  createTime?: Date;
}

export interface CloudFunctionResult {
  success: boolean;
  data?: User;
  message?: string;
  error?: string;
  errorDetails?: {
    code?: string;
    stack?: string;
  };
} 