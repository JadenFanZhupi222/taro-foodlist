import { fetchFamily } from './family/thunks'
import { fetchRecipes } from './recipe/thunks'
import type { AppDispatch } from '@/store'
import { getUser } from '@/utils/auth'

export const initApp = () => async (dispatch: AppDispatch) => {
  // 从本地或 store 获取 family_id
  const user = getUser()
  const family_id = user?.family_id
  if (family_id) {
    await dispatch(fetchFamily())
    await dispatch(fetchRecipes(family_id))
  }
} 