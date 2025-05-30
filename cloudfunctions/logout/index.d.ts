interface LogoutResult {
  success: boolean;
  message: string;
  error?: string;
  errorDetails?: {
    code?: string;
    stack?: string;
  };
}

declare function main(event: any, context: any): Promise<LogoutResult>;

export = main; 