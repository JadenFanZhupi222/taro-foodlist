import { RootState } from '../index'
import { createSelector } from 'reselect'

export const selectFamily = (state: RootState) => state.family.currentFamily
export const selectFamilyLoading = (state: RootState) => state.family.fetchLoading
export const selectCreateFamilyLoading = (state: RootState) => state.family.createLoading
export const selectJoinLoading = (state: RootState) => state.family.joinLoading
export const selectMembersInfo = (state: RootState) => state.family.membersInfo
export const selectCurrentFamily = (state: RootState) => state.family.currentFamily
export const selectFamilyMembers = createSelector(
  (state: RootState) => state.family.currentFamily?.members ?? [],
  (members) => members
)
export const selectIsFamilyOwner = createSelector(
  (state: RootState) => state.family.currentFamily,
  (state: RootState) => state.user.current,
  (currentFamily, currentUser) => currentFamily?.owner === currentUser?.openId
)
export const selectInviteFamily = (state: RootState) => state.family.inviteFamily
export const selectInviteFamilyLoading = (state: RootState) => state.family.inviteFamilyLoading
