export interface Recipe {
  id: string
  name: string
  type: string
  image: string
  description: string
  steps: string[]
  ingredients: {
    name: string
    amount: string
  }[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  userId: string
  content: string
  createdAt: Date
}

export interface RecipeState {
  recipes: Recipe[]
  currentRecipe: Recipe | null
  comments: Comment[]
}

export const RECIPE_ACTIONS = {
  SET_RECIPES: 'SET_RECIPES',
  SET_CURRENT_RECIPE: 'SET_CURRENT_RECIPE',
  SET_COMMENTS: 'SET_COMMENTS',
  ADD_RECIPE: 'ADD_RECIPE',
  UPDATE_RECIPE: 'UPDATE_RECIPE',
  DELETE_RECIPE: 'DELETE_RECIPE',
  ADD_COMMENT: 'ADD_COMMENT',
  CLEAR_RECIPES: 'CLEAR_RECIPES'
} as const

export type RecipeActionType = typeof RECIPE_ACTIONS[keyof typeof RECIPE_ACTIONS]

export type RecipeAction =
  | { type: typeof RECIPE_ACTIONS.SET_RECIPES; payload: Recipe[] }
  | { type: typeof RECIPE_ACTIONS.SET_CURRENT_RECIPE; payload: Recipe | null }
  | { type: typeof RECIPE_ACTIONS.SET_COMMENTS; payload: Comment[] }
  | { type: typeof RECIPE_ACTIONS.ADD_RECIPE; payload: Recipe }
  | { type: typeof RECIPE_ACTIONS.UPDATE_RECIPE; payload: Recipe }
  | { type: typeof RECIPE_ACTIONS.DELETE_RECIPE; payload: string }
  | { type: typeof RECIPE_ACTIONS.ADD_COMMENT; payload: Comment }
  | { type: typeof RECIPE_ACTIONS.CLEAR_RECIPES }