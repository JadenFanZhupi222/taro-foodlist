import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initialState'
import { fetchFamily, createFamily, joinFamily } from '@/thunks/family/thunks'

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    setFamily(state, action) {
      state.currentFamily = action.payload
      state.membersInfo = action.payload.membersInfo || []
    },
    clearFamily(state) {
      state.currentFamily = null
      state.membersInfo = []
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFamily.pending, (state) => { state.fetchLoading = true })
      .addCase(fetchFamily.fulfilled, (state) => { state.fetchLoading = false })
      .addCase(fetchFamily.rejected, (state) => { state.fetchLoading = false })
      .addCase(createFamily.pending, (state) => { state.createLoading = true })
      .addCase(createFamily.fulfilled, (state) => { state.createLoading = false })
      .addCase(createFamily.rejected, (state) => { state.createLoading = false })
      .addCase(joinFamily.pending, (state) => { state.joinLoading = true })
      .addCase(joinFamily.fulfilled, (state) => { state.joinLoading = false })
      .addCase(joinFamily.rejected, (state) => { state.joinLoading = false })
  }
})

export const { setFamily, clearFamily } = familySlice.actions
export const familyReducer = familySlice.reducer 