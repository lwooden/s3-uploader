// Local authentication database: keys are allowed user ids.
export const LOCAL_AUTH_USERS: Record<string, true> = {
  "testuser1-dhs": true,
  "testuser2-dhs": true,
}

export function isAuthorizedUserId(rawUserId: string): boolean {
  const id = rawUserId.trim()
  if (!id) return false
  return Object.prototype.hasOwnProperty.call(LOCAL_AUTH_USERS, id)
}
