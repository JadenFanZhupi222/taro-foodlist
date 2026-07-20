import { Recipe, Comment } from './types'

export interface RecipeState {
  recipes: Recipe[]
  comments: Comment[]
  fetchLoading: boolean
  catalogStatus: 'idle' | 'loading' | 'ready' | 'failed'
  catalogRequest: { requestId: string; familyId: string } | null
  createLoading: boolean
  updateLoading: boolean
  deleteLoading: boolean
  detailRequests: Record<string, { status: 'loading' | 'failed' | 'not-found'; requestId: string }>
}

export const initialState: RecipeState = {
  recipes: [],
  comments: [],
  fetchLoading: false,
  catalogStatus: 'idle',
  catalogRequest: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  detailRequests: {}
}
