import { createAsyncThunk } from '@reduxjs/toolkit'
import { callCloud } from '@/utils/cloud'
import type { Family } from '@/store/family/types'
import { setFamily, clearFamily, setInviteFamily, clearInviteFamily } from '@/store/family/familySlice'
import { toast } from '@/utils/toast'
import Taro from '@tarojs/taro'

// 获取家庭信息
export const fetchFamily = createAsyncThunk(
  'family/fetchFamily',
  async (_, { dispatch }) => {
    try {
      const result = await callCloud('get-family-info')
      const r = result as { code: number; data?: Family; message?: string }
      if (r.code === 0 && r.data) {
        dispatch(setFamily(r.data))
      } else {
        dispatch(clearFamily())
        if (r.code !== 1) {
          throw new Error(r.message || '获取家庭信息失败')
        }
      }
    } catch (error) {
      console.error('获取家庭信息失败:', error)
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
      const result = await callCloud('create-family', { familyName })
      const r = result as { code: number; data?: Family; message?: string }
      if (r.code === 0 && r.data) {
        // 创建成功后重新获取家庭信息，以获取完整的成员信息
        await dispatch(fetchFamily())
        toast({ title: '创建成功', icon: 'success' })
      } else {
        throw new Error(r.message || '创建家庭失败')
      }
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
      const loginResult = await callCloud('wechat-login', { code: loginRes.code })
      const openId = loginResult?.data?.openId
      if (!openId) throw new Error('获取openId失败')
      // 3. 调用 join-family 云函数
      const result = await callCloud('join-family', { familyId, openId })
      const r = result as { code: number; data?: Family; message?: string }
      if (r.code === 0 && r.data) {
        dispatch(setFamily(r.data))
      } else if (r.code === 3) {
        toast({ title: '已加入该家庭', icon: 'none' })
        dispatch(setFamily(r.data))
      } else {
        throw new Error(r.message || '加入家庭失败')
      }
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
      const result = await callCloud('leave-family')
      const r = result as { success: boolean; message?: string }
      if (r.success) {
        dispatch(clearFamily())
        toast({ title: '已退出家庭', icon: 'success' })
      } else {
        throw new Error(r.message || '退出家庭失败')
      }
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
      const result = await callCloud('get-family-info-by-id', { familyId })
      if (result.code === 0 && result.data) {
        dispatch(setInviteFamily(result.data))
      } else {
        dispatch(setInviteFamily(null))
        throw new Error(result.message || '获取家庭信息失败')
      }
      return result
    } catch (error) {
      dispatch(setInviteFamily(null))
      throw error
    }
  }
) 