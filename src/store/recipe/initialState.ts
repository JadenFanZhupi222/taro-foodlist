import { Recipe, Comment } from './types'

export interface RecipeState {
  recipes: Recipe[]
  comments: Comment[]
  fetchLoading: boolean
  createLoading: boolean
  updateLoading: boolean
  deleteLoading: boolean
  detailRequests: Record<string, { status: 'loading' | 'failed' | 'not-found' }>
}

export const initialState: RecipeState = {
  recipes: [],
  comments: [],
  fetchLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  detailRequests: {}
}
