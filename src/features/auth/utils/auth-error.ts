const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "The email or password is incorrect.",
  "Password should be at least 6 characters":
    "Password must be at least 8 characters.",
  "User already registered": "An account with that email already exists.",
};

const FALLBACK_AUTH_ERROR = "Something went wrong. Try again.";

export function getAuthErrorMessage(message: string) {
  return AUTH_ERROR_MESSAGES[message] ?? FALLBACK_AUTH_ERROR;
}
