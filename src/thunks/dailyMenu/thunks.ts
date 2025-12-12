import { createAsyncThunk } from '@reduxjs/toolkit'
import { DailyMenu } from '@/store/dailyMenu/types'
import { callCloud } from '@/utils/cloud'
import {
  setDailyMenus,
  addDailyMenu,
  clearDailyMenus,
  updateDailyMenu,
  addEmptyDate
} from '@/store/dailyMenu/dailyMenuSlice'
import { RootState } from '@/store'
import  { toast } from '@/utils/toast'
import { isSameDay, toDateKey } from '@/utils/date'

// 获取当前家庭所有 dailyMenus
export const fetchDailyMenus = createAsyncThunk(
  'dailyMenu/fetchDailyMenus',
  async ({ familyId }: { familyId: string }, { dispatch, getState }) => {
    try {
      const res = await callCloud<DailyMenu[]>('get-family-daily-menus', { familyId })
      const state = getState() as RootState
      const today = toDateKey(new Date())
      const localToday = state.dailyMenu.dailyMenus.find(m => isSameDay(m.date, today))
      const remoteMenus = res.data || []
      let mergedMenus = remoteMenus
      if (localToday) {
        mergedMenus = [
          ...remoteMenus.filter(m => !isSameDay(m.date, today)),
          localToday
        ]
      }
      dispatch(setDailyMenus(mergedMenus))
    } catch (error) {
      dispatch(clearDailyMenus())
      throw error
    }
  }
)

// 获取当前家庭某天的 dailyMenu
export const fetchDailyMenuByDate = createAsyncThunk(
  'dailyMenu/fetchDailyMenuByDate',
  async ({ familyId, date }: { familyId: string, date: string }, { dispatch, getState }) => {
    try {
      const res = await callCloud<DailyMenu>('get-family-daily-menu-by-date', { familyId, date })
      if (res.data) {
        const state = getState() as RootState
        const exists = state.dailyMenu.dailyMenus.some(
          m => m._id === res.data!._id
        )
        exists ? dispatch(updateDailyMenu(res.data)) : dispatch(addDailyMenu(res.data))
      } else {
        dispatch(addEmptyDate(date))
      }
    } catch (error) {
      throw error
    }
  }
)

export const createOrUpdateDailyMenu = createAsyncThunk(
  'dailyMenu/createOrUpdateDailyMenu',
  async (
    { familyId, date, recipe, userId }: { 
      familyId: string; 
      date: string; 
      recipe: { recipe_id: string };
      userId: string 
    },
    { dispatch }
  ) => {
    await callCloud('create-or-update-daily-menu', { familyId, date, recipe, userId })
    await dispatch(fetchDailyMenuByDate({ familyId, date }))
  }
)

export const removeRecipeFromMenu = createAsyncThunk(
  'dailyMenu/removeRecipeFromMenu',
  async ({ menuId, recipeId }: { menuId: string, recipeId: string }, { dispatch, getState }) => {
    await callCloud('remove-recipe-from-menu', { menuId, recipeId })
    // 刷新当天menu
    const menu = (getState() as RootState).dailyMenu.dailyMenus.find(m => m._id === menuId)
    if (menu) {
      await dispatch(fetchDailyMenuByDate({ familyId: menu.family_id, date: typeof menu.date === 'string' ? menu.date.slice(0, 10) : menu.date }))
    }
    toast({ title: '已移除', icon: 'success' })
  }
)
