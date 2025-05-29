import { FAMILY_ACTIONS } from './types'
import type { Family } from './types'

// Action Creators
export const setFamily = (family: Family) => ({
  type: FAMILY_ACTIONS.SET_FAMILY,
  payload: family
})

export const clearFamily = () => ({
  type: FAMILY_ACTIONS.CLEAR_FAMILY
}) 