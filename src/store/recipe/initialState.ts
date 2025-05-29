import { Recipe, Comment } from './types'

export interface RecipeState {
  recipes: Recipe[]
  currentRecipe: Recipe | null
  comments: Comment[]
}

export const initialState: RecipeState = {
  recipes: [],
  currentRecipe: null,
  comments: []
} 