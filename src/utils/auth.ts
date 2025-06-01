import Taro from '@tarojs/taro'
import type { User } from '@/store/user/types'

export const TOKEN_KEY = 'token'
export const USER_KEY = 'user'

export function getToken(): string | null {
  return Taro.getStorageSync(TOKEN_KEY) || null
}

export function getUser(): User | null {
  return Taro.getStorageSync(USER_KEY) || null
}

export function setToken(token: string) {
  Taro.setStorageSync(TOKEN_KEY, token)
}

export function setUser(user: User) {
  Taro.setStorageSync(USER_KEY, user)
}

export function clearAuth() {
  Taro.removeStorageSync(TOKEN_KEY)
  Taro.removeStorageSync(USER_KEY)
}

export function isLoggedIn(): boolean {
  return !!getToken() && !!getUser()
} 