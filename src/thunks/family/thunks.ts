import { createAsyncThunk } from '@reduxjs/toolkit'
import Taro from '@tarojs/taro'
import type { Family } from '@/store/family/types'
import { setFamily, clearFamily } from '@/store/family/familySlice'

export const fetchFamily = createAsyncThunk(
  'family/fetchFamily',
  async (_, { dispatch }) => {
    try {
      const { result } = await Taro.cloud.callFunction({
        name: 'get-family'
      })
      const r = result as { success: boolean; data?: Family; message?: string }
      if (r.success && r.data) {
        dispatch(setFamily(r.data))
      } else {
        throw new Error(r.message || '获取家庭信息失败')
      }
    } catch (error) {
      console.error('获取家庭信息失败:', error)
      Taro.showToast({ title: '获取家庭信息失败', icon: 'error' })
      throw error
    }
  }
)

export const createFamily = createAsyncThunk(
  'family/createFamily',
  async (name: string, { dispatch }) => {
    try {
      const { result } = await Taro.cloud.callFunction({
        name: 'create-family',
        data: { name }
      })
      const r = result as { success: boolean; data?: Family; message?: string }
      if (r.success && r.data) {
        dispatch(setFamily(r.data))
        Taro.showToast({ title: '创建成功', icon: 'success' })
      } else {
        throw new Error(r.message || '创建家庭失败')
      }
    } catch (error) {
      console.error('创建家庭失败:', error)
      Taro.showToast({ title: '创建失败', icon: 'error' })
      throw error
    }
  }
)

export const joinFamily = createAsyncThunk(
  'family/joinFamily',
  async (familyId: string, { dispatch }) => {
    try {
      const { result } = await Taro.cloud.callFunction({
        name: 'join-family',
        data: { familyId }
      })
      const r = result as { success: boolean; data?: Family; message?: string }
      if (r.success && r.data) {
        dispatch(setFamily(r.data))
        Taro.showToast({ title: '加入成功', icon: 'success' })
      } else {
        throw new Error(r.message || '加入家庭失败')
      }
    } catch (error) {
      console.error('加入家庭失败:', error)
      Taro.showToast({ title: '加入失败', icon: 'error' })
      throw error
    }
  }
)

export const leaveFamily = createAsyncThunk(
  'family/leaveFamily',
  async (_, { dispatch }) => {
    try {
      const { result } = await Taro.cloud.callFunction({
        name: 'leave-family'
      })
      const r = result as { success: boolean; message?: string }
      if (r.success) {
        dispatch(clearFamily())
        Taro.showToast({ title: '已退出家庭', icon: 'success' })
      } else {
        throw new Error(r.message || '退出家庭失败')
      }
    } catch (error) {
      console.error('退出家庭失败:', error)
      Taro.showToast({ title: '退出失败', icon: 'error' })
      throw error
    }
  }
) 