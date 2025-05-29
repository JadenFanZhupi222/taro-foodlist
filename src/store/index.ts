import { configureStore } from '@reduxjs/toolkit'
import { recipeReducer } from './recipe/recipeSlice'
import { userReducer } from './user/userSlice'
import { familyReducer } from './family/familySlice'

const store = configureStore({
  reducer: {
    recipe: recipeReducer,
    user: userReducer,
    family: familyReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store