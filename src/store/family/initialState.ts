import { Family } from './types'

export interface FamilyState {
  currentFamily: Family | null
}

export const initialState: FamilyState = {
  currentFamily: null
} 