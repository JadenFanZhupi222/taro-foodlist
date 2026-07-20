import { Family } from './types'
import type { User } from '../user/types'

export interface FamilyState {
  currentFamily: Family | null
  membersInfo: User[]
  fetchLoading: boolean
  fetchError: string | null
  fetchRequestId: string | null
  createLoading: boolean
  joinLoading: boolean
  inviteFamily: Family | null
  inviteFamilyLoading: boolean
  inviteError: string | null
  inviteErrorFamilyId: string | null
  inviteRequest: { familyId: string; requestId: string } | null
}

export const initialState: FamilyState = {
  currentFamily: null,
  membersInfo: [],
  fetchLoading: false,
  fetchError: null,
  fetchRequestId: null,
  createLoading: false,
  joinLoading: false,
  inviteFamily: null,
  inviteFamilyLoading: false,
  inviteError: null,
  inviteErrorFamilyId: null,
  inviteRequest: null
}
