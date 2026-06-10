import { fetchFamily } from './family/thunks'
import { fetchRecipes } from './recipe/thunks'
import type { AppDispatch, RootState } from '@/store'
import { getUser } from '@/utils/auth'

export const initApp = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const user = getUser()
  if (!user?.openId) return
  // 家庭归属以服务端 family.members 为准（云函数按身份推导），不再依赖本地缓存的 family_id
  await dispatch(fetchFamily())
  const family = getState().family.currentFamily
  if (family?._id) {
    await dispatch(fetchRecipes(family._id))
  }
}
