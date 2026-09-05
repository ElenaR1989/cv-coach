export function getIsAdmin(
  profile: { is_admin?: boolean | null; role?: string | null } | null,
  email?: string | null
) {
  return (
    profile?.is_admin === true ||
    profile?.role === "admin" ||
    email === "elena.zmau@icloud.com"
  )
}
