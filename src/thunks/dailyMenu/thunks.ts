import { createAsyncThunk } from '@reduxjs/toolkit'
import { DailyMenu } from '@/store/dailyMenu/types'
import { callCloud } from '@/utils/cloud'
import {
  setDailyMenus,
  addDailyMenu,
  updateDailyMenu,
  deleteDailyMenu,
  clearDailyMenus
} from '@/store/dailyMenu/dailyMenuSlice'

// 获取当前家庭所有 dailyMenus
export const fetchDailyMenus = createAsyncThunk(
  'dailyMenu/fetchDailyMenus',
  async ({ familyId }: { familyId: string }, { dispatch }) => {
    try {
      const res = await callCloud<DailyMenu[]>('get-family-daily-menus', { familyId })
      dispatch(setDailyMenus(res.data || []))
    } catch (error) {
      dispatch(clearDailyMenus())
      throw error
    }
  }
)

// 获取当前家庭某天的 dailyMenu
export const fetchDailyMenuByDate = createAsyncThunk(
  'dailyMenu/fetchDailyMenuByDate',
  async ({ familyId, date }: { familyId: string, date: string }, { dispatch }) => {
    try {
      const res = await callCloud<DailyMenu>('get-family-daily-menu-by-date', { familyId, date })
      if (res.data) {
        dispatch(addDailyMenu(res.data))
      }
    } catch (error) {
      throw error
    }
  }
)

// 创建 dailyMenu（添加第一个菜时自动创建）
export const createDailyMenu = createAsyncThunk(
  'dailyMenu/createDailyMenu',
  async (data: Partial<DailyMenu>, { dispatch }) => {
    const res = await callCloud<DailyMenu>('create-or-update-daily-menu', data)
    dispatch(addDailyMenu(res.data as DailyMenu))
  }
)

// 更新 dailyMenu
export const updateDailyMenuById = createAsyncThunk(
  'dailyMenu/updateDailyMenuById',
  async ({ id, data }: { id: string; data: Partial<DailyMenu> }, { dispatch }) => {
    const res = await callCloud<DailyMenu>('update-daily-menu', { id, ...data })
    dispatch(updateDailyMenu(res.data as DailyMenu))
  }
)

// 删除 dailyMenu
export const deleteDailyMenuById = createAsyncThunk(
  'dailyMenu/deleteDailyMenuById',
  async (id: string, { dispatch }) => {
    await callCloud('delete-daily-menu-if-empty', { id })
    dispatch(deleteDailyMenu(id))
  }
) 