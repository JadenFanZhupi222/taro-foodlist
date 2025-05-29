import { RECIPE_ACTIONS } from './types'
import type { Recipe, Comment } from './types'

// Action Creators
export const setRecipes = (recipes: Recipe[]) => ({
  type: RECIPE_ACTIONS.SET_RECIPES,
  payload: recipes
})

export const setCurrentRecipe = (recipe: Recipe | null) => ({
  type: RECIPE_ACTIONS.SET_CURRENT_RECIPE,
  payload: recipe
})

export const setComments = (comments: Comment[]) => ({
  type: RECIPE_ACTIONS.SET_COMMENTS,
  payload: comments
})

export const addRecipe = (recipe: Recipe) => ({
  type: RECIPE_ACTIONS.ADD_RECIPE,
  payload: recipe
})

export const updateRecipe = (recipe: Recipe) => ({
  type: RECIPE_ACTIONS.UPDATE_RECIPE,
  payload: recipe
})

export const deleteRecipe = (id: string) => ({
  type: RECIPE_ACTIONS.DELETE_RECIPE,
  payload: id
})

export const addComment = (comment: Comment) => ({
  type: RECIPE_ACTIONS.ADD_COMMENT,
  payload: comment
})

export const clearRecipes = () => ({
  type: RECIPE_ACTIONS.CLEAR_RECIPES
}) 