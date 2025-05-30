import Taro from '@tarojs/taro'

/**
 * 通用云函数调用封装
 * @param name 云函数名
 * @param data 参数对象
 * @returns result 字段（自动抛出云函数异常）
 */
export async function callCloud<T = any>(name: string, data: Record<string, any> = {}): Promise<T> {
  try {
    console.log('callCloud', name, data)
    const res = await Taro.cloud.callFunction({ name, data })
    if ('result' in res) {
      return res.result as T
    }
    // 兼容极端情况
    return res as T
  } catch (error) {
    throw error
  }
} 