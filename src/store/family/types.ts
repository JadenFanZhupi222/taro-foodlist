import type { User } from '../user/types'

export interface FamilyMember {
  userId: string
  role: 'owner' | 'member'
  permissions: string[]
}

export interface Family {
  _id: string
  name: string
  family_owner: string
  members: string[]
  membersInfo?: User[]
  createdAt: Date
}

export interface FamilyState {
  currentFamily: Family | null
  fetchLoading: boolean
  createLoading: boolean
  joinLoading: boolean
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