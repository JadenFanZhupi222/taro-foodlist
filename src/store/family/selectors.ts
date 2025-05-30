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

export const selectJoinLoading = (state: RootState) => state.family.joinLoading
export const selectInviteFamily = (state: RootState) => state.family.inviteFamily
export const selectInviteFamilyLoading = (state: RootState) => state.family.inviteFamilyLoading 