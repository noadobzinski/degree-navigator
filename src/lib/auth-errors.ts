/**
 * Translates raw Supabase auth failures into messages a student can act on.
 *
 * The most common report — "login says failed to fetch no matter what login I
 * try" — is not a wrong-password problem. `TypeError: Failed to fetch` (and
 * Supabase's `AuthRetryableFetchError`, which wraps it) is thrown when the
 * browser never reaches the auth server at all: an offline connection, a
 * privacy/ad-blocking extension that cancels the CORS preflight, a corporate
 * firewall/VPN, or a build that is missing its Supabase configuration. Showing
 * the raw "Failed to fetch" string leaves the user with no path forward, so we
 * detect that class of error and explain what to check instead.
 */

/** True when the failure is a network/transport problem rather than an auth rejection. */
export function isNetworkAuthError(error: unknown): boolean {
  if (!error) return false;

  const name =
    typeof error === "object" && error !== null && "name" in error
      ? String((error as { name: unknown }).name)
      : "";
  const message = error instanceof Error ? error.message : String(error);
  const haystack = `${name} ${message}`.toLowerCase();

  return (
    haystack.includes("failed to fetch") ||
    haystack.includes("networkerror") ||
    haystack.includes("network request failed") ||
    haystack.includes("load failed") || // Safari's wording for the same failure
    haystack.includes("authretryablefetcherror") ||
    haystack.includes("err_") // Chrome ERR_CONNECTION_RESET, ERR_NETWORK_CHANGED, etc.
  );
}

/** True when the app was built/deployed without its Supabase env vars. */
function isMissingConfigError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message.includes("Missing Supabase environment variable");
}

const NETWORK_MESSAGE =
  "Can't reach the sign-in server. Check your internet connection and, if you use an " +
  "ad blocker or privacy extension, disable it for this site (or try an incognito window " +
  "or another browser), then try again.";

const CONFIG_MESSAGE =
  "Sign-in is temporarily unavailable because the app is missing its Supabase configuration. " +
  "Please try again later.";

/** Returns a user-facing message for any error thrown during sign in / sign up. */
export function describeAuthError(error: unknown): string {
  if (isMissingConfigError(error)) return CONFIG_MESSAGE;
  if (isNetworkAuthError(error)) return NETWORK_MESSAGE;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong while signing in. Please try again.";
}
