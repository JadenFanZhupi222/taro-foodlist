interface GetUserInfoResult {
  code: number;
  data: any[];
  message: string;
}

declare function main(event: { openIds: string[] }, context: any): Promise<GetUserInfoResult>;

export = main; 