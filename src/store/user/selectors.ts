import { RootState } from '../index'

export const selectUser = (state: RootState) => state.user.current
export const selectIsLoggedIn = (state: RootState) => state.user.isLoggedIn
export const selectCode = (state: RootState) => state.user.code
export const selectLoginLoading = (state: RootState) => state.user.loginLoading
export const selectLogoutLoading = (state: RootState) => state.user.logoutLoading 