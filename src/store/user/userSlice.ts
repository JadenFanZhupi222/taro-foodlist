import { createSlice } from '@reduxjs/toolkit'
import { initialState as baseInitialState } from './initialState'
import { updateUserInfo, login, wechatLogin } from '@/thunks/user/thunks'

const initialState = {
  ...baseInitialState,
  loginLoading: false,
  profileLoading: false,
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
    }
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
  }
})

export const { setUser, logout, setCode } = userSlice.actions
export const userReducer = userSlice.reducer 