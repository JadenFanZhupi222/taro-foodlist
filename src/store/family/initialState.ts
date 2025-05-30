import { Family } from './types'
import type { User } from '../user/types'

export interface FamilyState {
  currentFamily: Family | null
  membersInfo: User[]
  fetchLoading: boolean
  createLoading: boolean
  joinLoading: boolean
}

export const initialState: FamilyState = {
  currentFamily: null,
  membersInfo: [],
  fetchLoading: false,
  createLoading: false,
  joinLoading: false
} 