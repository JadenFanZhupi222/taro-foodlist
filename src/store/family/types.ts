import Taro from '@tarojs/taro'

export interface FamilyMember {
  userId: string
  role: 'owner' | 'member'
  permissions: string[]
}

export interface Family {
  id: string
  name: string
  owner: string
  members: FamilyMember[]
  createdAt: Date
}

export interface FamilyState {
  currentFamily: Family | null
}

// Action Types
export const FAMILY_ACTIONS = {
  SET_FAMILY: 'SET_FAMILY',
  CLEAR_FAMILY: 'CLEAR_FAMILY'
} as const

export type FamilyActionType = typeof FAMILY_ACTIONS[keyof typeof FAMILY_ACTIONS]

export type FamilyAction =
  | { type: typeof FAMILY_ACTIONS.SET_FAMILY; payload: Family }
  | { type: typeof FAMILY_ACTIONS.CLEAR_FAMILY }