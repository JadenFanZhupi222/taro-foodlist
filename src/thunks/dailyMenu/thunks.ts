import { createAsyncThunk } from '@reduxjs/toolkit'
import { DailyMenu } from '@/store/dailyMenu/types'
import { callCloud } from '@/utils/cloud'
import {
  optimisticAddRecipe,
  optimisticRemoveRecipe
} from '@/store/dailyMenu/dailyMenuSlice'
import { RootState } from '@/store'
import  { toast } from '@/utils/toast'

// 获取当前家庭所有 dailyMenus
export const fetchDailyMenus = createAsyncThunk(
  'dailyMenu/fetchDailyMenus',
  async ({ familyId }: { familyId: string }) => {
    const res = await callCloud<DailyMenu[]>('get-family-daily-menus', { familyId })
    return { familyId, menus: res.data || [] }
  }
)

// 获取当前家庭某天的 dailyMenu（以服务端为权威，校正本地乐观状态）
export const fetchDailyMenuByDate = createAsyncThunk(
  'dailyMenu/fetchDailyMenuByDate',
  async ({ familyId, date }: { familyId: string, date: string }) => {
    const res = await callCloud<DailyMenu>('get-family-daily-menu-by-date', { familyId, date })
    return res.data || null
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
    // 1. 乐观添加：本地立即可见（纯 UI，不写服务端）
    dispatch(optimisticAddRecipe({
      familyId,
      date,
      item: { recipe_id: recipe.recipe_id, order: Date.now() }
    }))
    try {
      // 2. 写服务端
      await callCloud('create-or-update-daily-menu', { familyId, date, recipe, userId })
      // 3. 用权威数据校正本地（拿到真实 _id / order）
      await dispatch(fetchDailyMenuByDate({ familyId, date }))
    } catch (error) {
      // 4. 失败回滚：拉取真实状态恢复（撤销刚才的乐观添加），并提示
      await dispatch(fetchDailyMenuByDate({ familyId, date }))
      toast({ title: '添加失败，请重试', icon: 'none' })
      throw error
    }
  }
)

export const removeRecipeFromMenu = createAsyncThunk(
  'dailyMenu/removeRecipeFromMenu',
  async ({ menuId, recipeId }: { menuId: string, recipeId: string }, { dispatch, getState }) => {
    const menu = (getState() as RootState).dailyMenu.dailyMenus.find(m => m._id === menuId)
    const familyId = menu?.family_id || ''
    const date = menu ? (typeof menu.date === 'string' ? menu.date.slice(0, 10) : menu.date) : ''

    // 1. 乐观移除：本地立即移除（纯 UI，不写服务端）
    if (date && familyId) dispatch(optimisticRemoveRecipe({ familyId, date, recipeId }))
    try {
      // 2. 写服务端
      await callCloud('remove-recipe-from-menu', { menuId, recipeId })
      // 3. 校正本地
      if (date && familyId) await dispatch(fetchDailyMenuByDate({ familyId, date }))
      toast({ title: '已移除', icon: 'success' })
    } catch (error) {
      // 4. 失败回滚：拉取真实状态恢复（被误移除的菜品会回来），并提示
      if (date && familyId) await dispatch(fetchDailyMenuByDate({ familyId, date }))
      toast({ title: '移除失败，请重试', icon: 'none' })
      throw error
    }
  }
)
