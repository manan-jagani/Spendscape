const DEFAULT_AUTHENTICATED_PATH = "/dashboard";

export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = DEFAULT_AUTHENTICATED_PATH,
) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
