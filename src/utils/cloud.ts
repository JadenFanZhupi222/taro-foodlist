import Taro from '@tarojs/taro'
import { CloudResult } from '@/types/cloud'
import { getToken } from './auth'

/**
 * 通用云函数调用封装
 * @param name 云函数名
 * @param data 参数对象
 * @returns result 字段（自动抛出云函数异常）
 */
export async function callCloud<T>(name: string, data: Record<string, any> = {}): Promise<CloudResult<T>> {
  try {
    console.log('callCloud', name, data, 'token', getToken())
    // 自动带上 token
    const token = getToken()
    if (token) {
      data.token = token
    }
    const res = await Taro.cloud.callFunction({ name, data })
    if ('result' in res) {
      const result = res.result as CloudResult<T>
      if (result.code !== 0) {
        throw new Error(result.message || '云函数调用失败')
      }
      return result
    }
    // 兼容极端情况
    return res as CloudResult<T>
  } catch (error) {
    throw error
  }
} 