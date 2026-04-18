export function getIsPro(
  profile: {
    is_pro?: boolean | null
    plan?: string | null
  } | null
) {
  return profile?.is_pro === true || profile?.plan === "pro"
}