import { createAsyncThunk } from '@reduxjs/toolkit'
import Taro from '@tarojs/taro'
import { setUser, setCode, logout } from '@/store/user/userSlice'
import { CloudFunctionResult } from '@/types/cloud'
import type { RootState } from '@/store'

// 云函数返回类型
interface UpdateUserInfoResult {
  success: boolean;
  message: string;
  data?: unknown; // update 结果
  error?: unknown;
}

// 微信登录（接收 code 参数，调用云函数）
export const wechatLogin = createAsyncThunk(
  'user/wechatLogin',
  async (code: string, { dispatch }) => {
    const { result } = await Taro.cloud.callFunction({
      name: 'wechat-login',
      data: { code }
    })
    const cloudResult = result as CloudFunctionResult
    if (cloudResult.success && cloudResult.data) {
      console.log('data in wechatLogin Thunk', cloudResult.data)
      dispatch(setUser(cloudResult.data))
      Taro.showToast({ title: '登录成功', icon: 'success' })
    } else {
      Taro.showToast({ title: cloudResult.message || '登录失败', icon: 'error' })
    }
  }
)

// 普通登录（支持无参数）
export const login = createAsyncThunk(
  'user/login',
  async (_, { dispatch }) => {
    const res = await Taro.login()
    if (res.code) {
      dispatch(setCode(res.code))
    }
  }
)

// 更新用户信息（昵称/头像）
export const updateUserInfo = createAsyncThunk(
  'user/updateUserInfo',
  async ({ avatarFileId, avatar, nickname, openId }: { avatarFileId: string; avatar: string; nickname: string; openId: string }, { dispatch, getState }) => {
    const { result } = await Taro.cloud.callFunction({
      name: 'update-user-info',
      data: { avatarFileId, nickname, openId }
    })
    const typedResult = result as UpdateUserInfoResult
    // 只要 success 就用本地 user 信息和新数据更新
    const user = (getState() as RootState).user.current
    if (typedResult && typedResult.success) {
      if (user) {
        dispatch(setUser({ ...user, avatar, nickname }))
      }
    } else {
      throw new Error(typedResult && typedResult.message ? typedResult.message : '更新失败')
    }
    return typedResult
  }
)

// 退出登录
export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { dispatch }) => {
    try {
      await Taro.cloud.callFunction({ name: 'logout' })
      dispatch(logout())
      Taro.showToast({ title: '已退出登录', icon: 'success' })
    } catch (error) {
      console.error('退出登录失败:', error)
      Taro.showToast({ title: '退出失败', icon: 'error' })
      throw error
    }
  }
) 