// 这里迁移 src/store/recipe/recipeThunks.ts 的内容
// ... existing code ...

import { createAsyncThunk } from '@reduxjs/toolkit'
import Taro from '@tarojs/taro'
import type { Recipe, Comment } from '@/store/recipe/types'
import {
  setRecipes,
  setCurrentRecipe,
  setComments,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  addComment
} from '@/store/recipe/recipeSlice'

export const fetchRecipes = createAsyncThunk(
  'recipe/fetchRecipes',
  async (_, { dispatch }) => {
    try {
      const { result } = await Taro.cloud.callFunction({
        name: 'get-recipes'
      })
      const r = result as { success: boolean; data?: Recipe[]; message?: string }
      if (r.success && r.data) {
        dispatch(setRecipes(r.data))
      } else {
        throw new Error(r.message || '获取食谱失败')
      }
    } catch (error) {
      console.error('获取食谱失败:', error)
      Taro.showToast({ title: '获取食谱失败', icon: 'error' })
      throw error
    }
  }
)

export const fetchRecipeById = createAsyncThunk(
  'recipe/fetchRecipeById',
  async (recipeId: string, { dispatch }) => {
    try {
      const { result } = await Taro.cloud.callFunction({
        name: 'get-recipe',
        data: { recipeId }
      })
      const r = result as { success: boolean; data?: Recipe; message?: string }
      if (r.success && r.data) {
        dispatch(setCurrentRecipe(r.data))
      } else {
        throw new Error(r.message || '获取食谱详情失败')
      }
    } catch (error) {
      console.error('获取食谱详情失败:', error)
      Taro.showToast({ title: '获取食谱详情失败', icon: 'error' })
      throw error
    }
  }
)

export const createRecipe = createAsyncThunk(
  'recipe/createRecipe',
  async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>, { dispatch }) => {
    try {
      const { result } = await Taro.cloud.callFunction({
        name: 'create-recipe',
        data: recipe
      })
      const r = result as { success: boolean; data?: Recipe; message?: string }
      if (r.success && r.data) {
        dispatch(addRecipe(r.data))
        Taro.showToast({ title: '创建成功', icon: 'success' })
      } else {
        throw new Error(r.message || '创建食谱失败')
      }
    } catch (error) {
      console.error('创建食谱失败:', error)
      Taro.showToast({ title: '创建失败', icon: 'error' })
      throw error
    }
  }
)

export const updateRecipeById = createAsyncThunk(
  'recipe/updateRecipeById',
  async ({ recipeId, recipe }: { recipeId: string; recipe: Partial<Recipe> }, { dispatch }) => {
    try {
      const { result } = await Taro.cloud.callFunction({
        name: 'update-recipe',
        data: { recipeId, recipe }
      })
      const r = result as { success: boolean; data?: Recipe; message?: string }
      if (r.success && r.data) {
        dispatch(updateRecipe(r.data))
        Taro.showToast({ title: '更新成功', icon: 'success' })
      } else {
        throw new Error(r.message || '更新食谱失败')
      }
    } catch (error) {
      console.error('更新食谱失败:', error)
      Taro.showToast({ title: '更新失败', icon: 'error' })
      throw error
    }
  }
)

export const deleteRecipeById = createAsyncThunk(
  'recipe/deleteRecipeById',
  async (recipeId: string, { dispatch }) => {
    try {
      const { result } = await Taro.cloud.callFunction({
        name: 'delete-recipe',
        data: { recipeId }
      })
      const r = result as { success: boolean; message?: string }
      if (r.success) {
        dispatch(deleteRecipe(recipeId))
        Taro.showToast({ title: '删除成功', icon: 'success' })
      } else {
        throw new Error(r.message || '删除食谱失败')
      }
    } catch (error) {
      console.error('删除食谱失败:', error)
      Taro.showToast({ title: '删除失败', icon: 'error' })
      throw error
    }
  }
)

export const fetchComments = createAsyncThunk(
  'recipe/fetchComments',
  async (recipeId: string, { dispatch }) => {
    try {
      const { result } = await Taro.cloud.callFunction({
        name: 'get-comments',
        data: { recipeId }
      })
      const r = result as { success: boolean; data?: Comment[]; message?: string }
      if (r.success && r.data) {
        dispatch(setComments(r.data))
      } else {
        throw new Error(r.message || '获取评论失败')
      }
    } catch (error) {
      console.error('获取评论失败:', error)
      Taro.showToast({ title: '获取评论失败', icon: 'error' })
      throw error
    }
  }
)

export const createComment = createAsyncThunk(
  'recipe/createComment',
  async ({ recipeId, content }: { recipeId: string; content: string }, { dispatch }) => {
    try {
      const { result } = await Taro.cloud.callFunction({
        name: 'create-comment',
        data: { recipeId, content }
      })
      const r = result as { success: boolean; data?: Comment; message?: string }
      if (r.success && r.data) {
        dispatch(addComment(r.data))
        Taro.showToast({ title: '评论成功', icon: 'success' })
      } else {
        throw new Error(r.message || '评论失败')
      }
    } catch (error) {
      console.error('评论失败:', error)
      Taro.showToast({ title: '评论失败', icon: 'error' })
      throw error
    }
  }
)