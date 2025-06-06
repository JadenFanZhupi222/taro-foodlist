import { createSlice } from '@reduxjs/toolkit'
import { initialState as baseInitialState } from './initialState'
import { updateUserInfo, login, wechatLogin, logoutUser } from '@/thunks/user/thunks'

const initialState = {
  ...baseInitialState,
  loginLoading: false,
  profileLoading: false,
  logoutLoading: false,
  guideLogin: false,
  loginChecked: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.current = action.payload
      state.isLoggedIn = true
    },
    logout(state) {
      state.current = null
      state.isLoggedIn = false
      state.code = null
    },
    setCode(state, action) {
      state.code = action.payload
    },
    setGuideLogin(state, action) {
      state.guideLogin = action.payload
    },
    setLoginChecked(state, action) {
      state.loginChecked = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录相关 loading
      .addCase(login.pending, (state) => { state.loginLoading = true })
      .addCase(login.fulfilled, (state) => { state.loginLoading = false })
      .addCase(login.rejected, (state) => { state.loginLoading = false })
      .addCase(wechatLogin.pending, (state) => { state.loginLoading = true })
      .addCase(wechatLogin.fulfilled, (state) => { state.loginLoading = false })
      .addCase(wechatLogin.rejected, (state) => { state.loginLoading = false })
      // 资料/头像相关 loading
      .addCase(updateUserInfo.pending, (state) => { state.profileLoading = true })
      .addCase(updateUserInfo.fulfilled, (state) => { state.profileLoading = false })
      .addCase(updateUserInfo.rejected, (state) => { state.profileLoading = false })
      // 退出登录 loading
      .addCase(logoutUser.pending, (state) => { state.logoutLoading = true })
      .addCase(logoutUser.fulfilled, (state) => { state.logoutLoading = false })
      .addCase(logoutUser.rejected, (state) => { state.logoutLoading = false })
  }
})

export const { setUser, logout, setCode, setGuideLogin, setLoginChecked } = userSlice.actions
export const userReducer = userSlice.reducer 