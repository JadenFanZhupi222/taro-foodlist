import { Recipe, Comment } from './types'

export interface RecipeState {
  recipes: Recipe[]
  currentRecipe: Recipe | null
  comments: Comment[]
  fetchLoading: boolean
  createLoading: boolean
  updateLoading: boolean
  deleteLoading: boolean
}

export const initialState: RecipeState = {
  recipes: [],
  currentRecipe: null,
  comments: [],
  fetchLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false
} 