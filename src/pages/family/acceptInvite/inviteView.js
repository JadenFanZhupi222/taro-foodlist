function classifyInviteView({ familyId, inviteFamily, inviteError }) {
  if (!familyId || inviteError) return 'error'
  if (inviteFamily?._id === familyId) return 'ready'
  return 'loading'
}

module.exports = { classifyInviteView }
