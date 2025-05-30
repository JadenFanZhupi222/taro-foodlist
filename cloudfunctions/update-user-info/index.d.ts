
  interface UpdateUserInfoData {
    avatarUrl: string;
    nickName: string;
  }

  interface CloudFunctionEvent {
    avatarUrl: string;
    nickName: string;
  }

  interface CloudFunctionResult {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  }

  export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
  