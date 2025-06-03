import { configureStore } from '@reduxjs/toolkit'
import { recipeReducer } from './recipe/recipeSlice'
import { userReducer } from './user/userSlice'
import { familyReducer } from './family/familySlice'
import { dailyMenuReducer } from './dailyMenu/dailyMenuSlice'

const store = configureStore({
  reducer: {
    recipe: recipeReducer,
    user: userReducer,
    family: familyReducer,
    dailyMenu: dailyMenuReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store