import { RootState } from '../index'

export const selectFamily = (state: RootState) => state.family.currentFamily
export const selectFamilyLoading = (state: RootState) => state.family.fetchLoading
export const selectCreateFamilyLoading = (state: RootState) => state.family.createLoading
export const selectJoinFamilyLoading = (state: RootState) => state.family.joinLoading
export const selectMembersInfo = (state: RootState) => state.family.membersInfo

export const selectCurrentFamily = (state: RootState) => state.family.currentFamily
export const selectFamilyMembers = (state: RootState) => state.family.currentFamily?.members ?? []
export const selectIsFamilyOwner = (state: RootState) => {
  const currentFamily = state.family.currentFamily
  const currentUser = state.user.current
  return currentFamily?.owner === currentUser?.openId
} 