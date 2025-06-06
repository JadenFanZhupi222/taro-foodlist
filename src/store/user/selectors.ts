import { RootState } from '@/store'

export const selectUser = (state: RootState) => state.user.current
export const selectIsLoggedIn = (state: RootState) => state.user.isLoggedIn
export const selectCode = (state: RootState) => state.user.code
export const selectLoginLoading = (state: RootState) => state.user.loginLoading
export const selectLogoutLoading = (state: RootState) => state.user.logoutLoading
export const selectProfileLoading = (state: RootState) => state.user.profileLoading
export const selectGuideLogin = (state: RootState) => state.user.guideLogin
export const selectLoginChecked = (state: RootState) => state.user.loginChecked 