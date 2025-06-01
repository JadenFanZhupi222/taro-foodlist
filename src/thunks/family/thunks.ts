import { createAsyncThunk } from '@reduxjs/toolkit'
import { callCloud } from '@/utils/cloud'
import type { Family } from '@/store/family/types'
import { setFamily, clearFamily, setInviteFamily } from '@/store/family/familySlice'
import { toast } from '@/utils/toast'
import Taro from '@tarojs/taro'
import type { User } from '@/store/user/types'

// 获取家庭信息
export const fetchFamily = createAsyncThunk(
  'family/fetchFamily',
  async (_, { dispatch }) => {
    try {
      const r = await callCloud<Family>('get-family-info')
      dispatch(setFamily(r.data!))
    } catch (error) {
      console.error('获取家庭信息失败:', error)
      dispatch(clearFamily())
      toast({ title: '获取家庭信息失败', icon: 'error' })
      throw error
    }
  }
)

// 创建家庭
export const createFamily = createAsyncThunk(
  'family/createFamily',
  async (familyName: string, { dispatch }) => {
    try {
      await callCloud<Family>('create-family', { familyName })
      // 创建成功后重新获取家庭信息，以获取完整的成员信息
      await dispatch(fetchFamily())
      toast({ title: '创建成功', icon: 'success' })
    } catch (error) {
      console.error('创建家庭失败:', error)
      toast({ title: '创建失败', icon: 'error' })
      throw error
    }
  }
)

// 加入家庭
export const joinFamily = createAsyncThunk(
  'family/joinFamily',
  async (familyId: string, { dispatch }) => {
    try {
      // 1. 先Taro.login获取code
      const loginRes = await Taro.login()
      if (!loginRes.code) throw new Error('微信登录失败')
      // 2. 调用 wechat-login 云函数获取 openId
      const loginResult = await callCloud<User>('wechat-login', { code: loginRes.code })
      const openId = loginResult.data!.openId
      // 3. 调用 join-family 云函数
      const r = await callCloud<Family>('join-family', { familyId, openId })
      dispatch(setFamily(r.data!))
    } catch (error) {
      console.error('加入家庭失败:', error)
      toast({ title: '加入失败', icon: 'error' })
      throw error
    }
  }
)

export const leaveFamily = createAsyncThunk(
  'family/leaveFamily',
  async (_, { dispatch }) => {
    try {
      await callCloud<null>('leave-family')
      dispatch(clearFamily())
      toast({ title: '已退出家庭', icon: 'success' })
    } catch (error) {
      console.error('退出家庭失败:', error)
      toast({ title: '退出失败', icon: 'error' })
      throw error
    }
  }
)

// 通过 familyId 获取任意家庭信息
export const fetchFamilyById = createAsyncThunk(
  'family/fetchFamilyById',
  async (familyId: string, { dispatch }) => {
    try {
      dispatch(setInviteFamily(null))
      const r = await callCloud<Family>('get-family-info-by-id', { familyId })
      dispatch(setInviteFamily(r.data!))
      return r
    } catch (error) {
      dispatch(setInviteFamily(null))
      throw error
    }
  }
) 