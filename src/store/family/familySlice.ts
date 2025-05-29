import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initialState'

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    setFamily(state, action) {
      state.currentFamily = action.payload
    },
    clearFamily(state) {
      state.currentFamily = null
    }
  }
})

export const { setFamily, clearFamily } = familySlice.actions
export const familyReducer = familySlice.reducer 