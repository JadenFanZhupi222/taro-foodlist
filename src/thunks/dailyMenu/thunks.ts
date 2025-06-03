import { createAsyncThunk } from '@reduxjs/toolkit'
import { DailyMenu } from '@/store/dailyMenu/types'
import { callCloud } from '@/utils/cloud'
import {
  setDailyMenus,
  addDailyMenu,
  clearDailyMenus,
  updateDailyMenu,
} from '@/store/dailyMenu/dailyMenuSlice'
import { RootState } from '@/store'

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
  async ({ familyId, date }: { familyId: string, date: string }, { dispatch, getState }) => {
    try {
      const res = await callCloud<DailyMenu>('get-family-daily-menu-by-date', { familyId, date })
      if (res.data) {
        const state = getState() as RootState
        const exists = state.dailyMenu.dailyMenus.some(
          m => m._id === res.data!._id
        )
        if (exists) {
          dispatch(updateDailyMenu(res.data))
        } else {
          dispatch(addDailyMenu(res.data))
        }
      }
    } catch (error) {
      throw error
    }
  }
)

export const createOrUpdateDailyMenu = createAsyncThunk(
  'dailyMenu/createOrUpdateDailyMenu',
  async (
    { familyId, date, recipe, userId }: { familyId: string; date: string; recipe: { recipe_id: string; order: number }; userId: string },
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
  }
) 