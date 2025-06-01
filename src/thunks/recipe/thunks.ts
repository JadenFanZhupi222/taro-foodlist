// 这里迁移 src/store/recipe/recipeThunks.ts 的内容
// ... existing code ...

import { createAsyncThunk } from '@reduxjs/toolkit'
import { callCloud } from '@/utils/cloud'
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
import { toast } from '@/utils/toast'

export const fetchRecipes = createAsyncThunk(
  'recipe/fetchRecipes',
  async (familyId: string, { dispatch }) => {
    try {
      const r = await callCloud<Recipe[]>('get-recipes', { familyId })
      dispatch(setRecipes(r.data!))
    } catch (error) {
      toast({ title: '获取食谱失败', icon: 'error' })
      throw error
    }
  }
)

export const fetchRecipeById = createAsyncThunk(
  'recipe/fetchRecipeById',
  async (recipeId: string, { dispatch }) => {
    try {
      const r = await callCloud<Recipe>('get-recipe', { recipeId })
      dispatch(setCurrentRecipe(r.data!))
    } catch (error) {
      console.error('获取食谱详情失败:', error)
      toast({ title: '获取食谱详情失败', icon: 'error' })
      throw error
    }
  }
)

export const createRecipe = createAsyncThunk(
  'recipe/createRecipe',
  async ({ familyId, recipe }: { familyId: string; recipe: Omit<Recipe, '_id'> }, { dispatch }) => {
    try {
      const r = await callCloud<Recipe>('create-recipe', { familyId, recipe })
      dispatch(addRecipe(r.data!))
      toast({ title: '创建成功', icon: 'success' })
    } catch (error) {
      toast({ title: '创建失败', icon: 'error' })
      throw error
    }
  }
)

export const updateRecipeById = createAsyncThunk(
  'recipe/updateRecipeById',
  async ({ recipeId, recipe }: { recipeId: string; recipe: Partial<Omit<Recipe, '_id'>> }, { dispatch }) => {
    try {
      const r = await callCloud<Recipe>('update-recipe', { recipeId, recipe })
      dispatch(updateRecipe(r.data!))
      toast({ title: '更新成功', icon: 'success' })
    } catch (error) {
      toast({ title: '更新失败', icon: 'error' })
      throw error
    }
  }
)

export const deleteRecipeById = createAsyncThunk(
  'recipe/deleteRecipeById',
  async ({ familyId, recipeId }: { familyId: string; recipeId: string }, { dispatch }) => {
    try {
      await callCloud<null>('delete-recipe', { familyId, recipeId })
      dispatch(deleteRecipe(recipeId))
      toast({ title: '删除成功', icon: 'success' })
    } catch (error) {
      toast({ title: '删除失败', icon: 'error' })
      throw error
    }
  }
)

export const fetchComments = createAsyncThunk(
  'recipe/fetchComments',
  async (recipeId: string, { dispatch }) => {
    try {
      const r = await callCloud<Comment[]>('get-comments', { recipeId })
      dispatch(setComments(r.data!))
    } catch (error) {
      console.error('获取评论失败:', error)
      toast({ title: '获取评论失败', icon: 'error' })
      throw error
    }
  }
)

export const createComment = createAsyncThunk(
  'recipe/createComment',
  async ({ recipeId, content }: { recipeId: string; content: string }, { dispatch }) => {
    try {
      const r = await callCloud<Comment>('create-comment', { recipeId, content })
      dispatch(addComment(r.data!))
      toast({ title: '评论成功', icon: 'success' })
    } catch (error) {
      console.error('评论失败:', error)
      toast({ title: '评论失败', icon: 'error' })
      throw error
    }
  }
)