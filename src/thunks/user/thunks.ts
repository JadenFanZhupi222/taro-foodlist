import { createAsyncThunk } from '@reduxjs/toolkit'
import Taro from '@tarojs/taro'
import { setUser, setCode, logout } from '@/store/user/userSlice'
import { CloudFunctionResult } from '@/types/cloud'
import type { RootState } from '@/store'
import { toast } from '@/utils/toast'
import { callCloud } from '@/utils/cloud'

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
    const result = await callCloud('wechat-login', { code })
    const cloudResult = result as CloudFunctionResult
    if (cloudResult.success && cloudResult.data) {
      dispatch(setUser(cloudResult.data))
      toast({ title: '登录成功', icon: 'success' })
    } else {
      toast({ title: cloudResult.message || '登录失败', icon: 'error' })
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
    const result = await callCloud('update-user-info', { avatarFileId, nickname, openId })
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
      await callCloud('logout')
      dispatch(logout())
      toast({ title: '已退出登录', icon: 'success' })
    } catch (error) {
      console.error('退出登录失败:', error)
      toast({ title: '退出失败', icon: 'error' })
      throw error
    }
  }
) 