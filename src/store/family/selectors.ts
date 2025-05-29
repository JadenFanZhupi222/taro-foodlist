import { RootState } from '../index'

export const selectCurrentFamily = (state: RootState) => state.family.currentFamily
export const selectFamilyMembers = (state: RootState) => state.family.currentFamily?.members ?? []
export const selectIsFamilyOwner = (state: RootState) => {
  const currentFamily = state.family.currentFamily
  const currentUser = state.user.user
  return currentFamily?.owner === currentUser?.id
} 