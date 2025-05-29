import { User } from './types'

export interface UserState {
  current: User | null
  isLoggedIn: boolean
  code: string | null
  loginLoading?: boolean
  profileLoading?: boolean
}

export const initialState: UserState = {
  current: null,
  isLoggedIn: false,
  code: null,
  loginLoading: false,
  profileLoading: false
} 