import { createAsyncThunk } from '@reduxjs/toolkit'
import Taro from '@tarojs/taro'
import { setUser, setCode, logout } from '@/store/user/userSlice'
import type { RootState } from '@/store'
import { toast } from '@/utils/toast'
import { callCloud } from '@/utils/cloud'
import type { User } from '@/store/user/types'
import { setToken, setUser as setUserStorage, clearAuth } from '@/utils/auth'
import { resetFamily } from '@/store/family/familySlice'
import { resetRecipes } from '@/store/recipe/recipeSlice'
import { resetDailyMenu } from '@/store/dailyMenu/dailyMenuSlice'
import { initApp } from '@/thunks/initApp'

// 微信登录（接收 code 参数，调用云函数）
export const wechatLogin = createAsyncThunk(
  'user/wechatLogin',
  async (code: string, { dispatch }) => {
    const cloudResult = await callCloud<User>('wechat-login', { code })
    dispatch(setUser(cloudResult.data!))
    // 持久化 user 和 token
    setUserStorage(cloudResult.data!)
    setToken(cloudResult.data!.token!)
    await dispatch(initApp())
    toast({ title: '登录成功', icon: 'success' })
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
    const typedResult = await callCloud<unknown>('update-user-info', { avatarFileId, nickname, openId })
    const user = (getState() as RootState).user.current
    if (user) {
      const updatedUser = { ...user, avatar, nickname }
      dispatch(setUser(updatedUser))
      setUserStorage(updatedUser)
    }
    return typedResult
  }
)

// 退出登录
export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { dispatch }) => {
    try {
      await callCloud<null>('logout')
      dispatch(logout())
      dispatch(resetFamily())
      dispatch(resetRecipes())
      dispatch(resetDailyMenu())
      clearAuth()
      toast({ title: '已退出登录', icon: 'success' })
    } catch (error) {
      console.error('退出登录失败:', error)
      toast({ title: '退出失败', icon: 'error' })
      throw error
    }
  }
) 