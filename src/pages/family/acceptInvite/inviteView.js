function classifyInviteView({ familyId, inviteFamily, inviteError }) {
  if (!familyId || inviteError) return 'error'
  if (inviteFamily) return 'ready'
  return 'loading'
}

module.exports = { classifyInviteView }
