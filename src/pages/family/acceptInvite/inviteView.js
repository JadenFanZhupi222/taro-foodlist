function classifyInviteView({ familyId, inviteFamily, inviteError, inviteErrorFamilyId }) {
  if (!familyId) return 'error'
  if (inviteError && inviteErrorFamilyId === familyId) return 'error'
  if (inviteFamily?._id === familyId) return 'ready'
  return 'loading'
}

export { classifyInviteView }
