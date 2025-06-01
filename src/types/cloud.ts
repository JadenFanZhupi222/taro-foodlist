// 通用云函数返回类型
export interface CloudResult<T> {
  code: number;
  message: string;
  data?: T;
  error?: string;
} 