import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initialState'
import { fetchFamily, createFamily, joinFamily, fetchFamilyById } from '@/thunks/family/thunks'
import familyRequestModule = require('./familyRequest')
const { startFamilyRequest, fulfillFamilyRequest, rejectFamilyRequest, startInviteRequest, fulfillInviteRequest, rejectInviteRequest } = familyRequestModule

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    setFamily(state, action) {
      state.currentFamily = action.payload
      state.membersInfo = action.payload.membersInfo || []
      state.fetchRequestId = null
      state.fetchLoading = false
      state.fetchError = null
    },
    clearFamily(state) {
      state.currentFamily = null
      state.membersInfo = []
      state.fetchRequestId = null
      state.fetchLoading = false
      state.fetchError = null
    },
    setInviteFamily(state, action) {
      state.inviteFamily = action.payload
      state.inviteRequest = null
      state.inviteFamilyLoading = false
      state.inviteError = null
      state.inviteErrorFamilyId = null
    },
    clearInviteFamily(state) {
      state.inviteFamily = null
      state.inviteRequest = null
      state.inviteFamilyLoading = false
      state.inviteError = null
      state.inviteErrorFamilyId = null
    },
    resetFamily: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFamily.pending, (state, action) => { startFamilyRequest(state, action.meta.requestId) })
      .addCase(fetchFamily.fulfilled, (state, action) => { fulfillFamilyRequest(state, action.meta.requestId, action.payload) })
      .addCase(fetchFamily.rejected, (state, action) => { rejectFamilyRequest(state, action.meta.requestId, action.error.message) })
      .addCase(createFamily.pending, (state) => { state.createLoading = true })
      .addCase(createFamily.fulfilled, (state) => { state.createLoading = false })
      .addCase(createFamily.rejected, (state) => { state.createLoading = false })
      .addCase(joinFamily.pending, (state) => { state.joinLoading = true })
      .addCase(joinFamily.fulfilled, (state) => { state.joinLoading = false })
      .addCase(joinFamily.rejected, (state) => { state.joinLoading = false })
      .addCase(fetchFamilyById.pending, (state, action) => { startInviteRequest(state, action.meta.arg, action.meta.requestId) })
      .addCase(fetchFamilyById.fulfilled, (state, action) => { fulfillInviteRequest(state, action.meta.arg, action.meta.requestId, action.payload) })
      .addCase(fetchFamilyById.rejected, (state, action) => { rejectInviteRequest(state, action.meta.arg, action.meta.requestId, action.error.message) })
  }
})

export const { setFamily, clearFamily, setInviteFamily, clearInviteFamily, resetFamily } = familySlice.actions
export const familyReducer = familySlice.reducer
