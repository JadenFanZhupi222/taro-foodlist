import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initialState'
import { fetchFamily, createFamily, joinFamily, fetchFamilyById } from '@/thunks/family/thunks'

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
    },
    setInviteFamily(state, action) {
      state.inviteFamily = action.payload
    },
    clearInviteFamily(state) {
      state.inviteFamily = null
    },
    resetFamily: () => initialState,
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
      .addCase(fetchFamilyById.pending, (state) => { state.inviteFamilyLoading = true })
      .addCase(fetchFamilyById.fulfilled, (state) => { state.inviteFamilyLoading = false })
      .addCase(fetchFamilyById.rejected, (state) => { state.inviteFamilyLoading = false })
  }
})

export const { setFamily, clearFamily, setInviteFamily, clearInviteFamily, resetFamily } = familySlice.actions
export const familyReducer = familySlice.reducer 