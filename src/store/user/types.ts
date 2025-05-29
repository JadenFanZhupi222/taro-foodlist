export interface User {
  _id?: string;
  openId: string;
  appId: string;
  unionId: string;
  nickname: string;
  avatar: string;
  createTime?: Date;
}

export interface UserState {
  current: User | null;
  isLoggedIn: boolean;
  code: string | null;
  loginLoading?: boolean;
  profileLoading?: boolean;
}

export const USER_ACTIONS = {
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SET_CODE: 'SET_CODE'
} as const

export type UserActionType = typeof USER_ACTIONS[keyof typeof USER_ACTIONS]

export type UserAction =
  | { type: typeof USER_ACTIONS.SET_USER; payload: User }
  | { type: typeof USER_ACTIONS.LOGOUT }
  | { type: typeof USER_ACTIONS.SET_CODE; payload: string | null } 