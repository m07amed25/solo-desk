export const locales = ["en", "ar"] as const;
export const themes = ["dark", "light", "system"] as const;
export const appDestinations = [
  "/app",
  "/app/workspace",
  "/app/account",
] as const;
export const returnPaths = [
  "/",
  "/sign-in",
  "/sign-up",
  "/app",
  "/app/workspace",
  "/app/account",
] as const;
export type SiteLocale = (typeof locales)[number];
export type SiteTheme = (typeof themes)[number];
export type AppDestination = (typeof appDestinations)[number];
export type ReturnPath = (typeof returnPaths)[number];
export type AuthEntry = "sign-in" | "sign-up";
export const preferenceLimit = 2048;

export function isLocale(value: unknown): value is SiteLocale {
  return value === "en" || value === "ar";
}
export function isTheme(value: unknown): value is SiteTheme {
  return value === "dark" || value === "light" || value === "system";
}
export function isAppDestination(value: unknown): value is AppDestination {
  return appDestinations.some((path) => path === value);
}
export function isReturnPath(value: unknown): value is ReturnPath {
  return returnPaths.some((path) => path === value);
}
export function authReturnPath(value: unknown): AppDestination {
  return isAppDestination(value) ? value : "/app";
}
export function presentation(locale: unknown, theme: unknown) {
  const language = isLocale(locale) ? locale : "en";
  return {
    locale: language,
    theme: isTheme(theme) ? theme : "dark",
    dir: language === "ar" ? "rtl" : "ltr",
  } as const;
}
export function authEntry(value: unknown): AuthEntry {
  return value === "sign-up" ? "sign-up" : "sign-in";
}
export function authFailure(entry: AuthEntry) {
  return `/${entry}?authError=1`;
}
export function normalizedAuthPath(entry: AuthEntry, params: URLSearchParams) {
  if (!params.size) return null;
  if (
    new TextEncoder().encode(params.toString()).byteLength > preferenceLimit
  ) {
    return authFailure(entry);
  }
  for (const key of params.keys()) {
    if (key !== "authError" && key !== "returnTo") {
      return authFailure(entry);
    }
  }
  if (
    params.getAll("authError").length > 1 ||
    params.getAll("returnTo").length > 1
  ) {
    return authFailure(entry);
  }
  const authError = params.get("authError");
  if (authError !== null && authError !== "1") {
    return authFailure(entry);
  }
  const returnTo = params.get("returnTo");
  if (returnTo !== null && !isAppDestination(returnTo)) {
    return authFailure(entry);
  }
  return null;
}
export function callbackEntry(params: URLSearchParams) {
  return params.getAll("entry").length === 1
    ? authEntry(params.get("entry"))
    : "sign-in";
}
export function callbackReturnTo(params: URLSearchParams): AppDestination {
  if (params.getAll("returnTo").length === 1) {
    const returnTo = params.get("returnTo");
    if (isAppDestination(returnTo)) return returnTo;
  }
  return "/app";
}
export function parsePreferences(body: string) {
  if (new TextEncoder().encode(body).byteLength > preferenceLimit) return null;
  const fields = new URLSearchParams(body);
  if (
    fields.size !== 3 ||
    ["locale", "theme", "returnTo"].some(
      (key) => fields.getAll(key).length !== 1,
    )
  )
    return null;
  const locale = fields.get("locale"),
    theme = fields.get("theme"),
    returnTo = fields.get("returnTo");
  return isLocale(locale) && isTheme(theme) && isReturnPath(returnTo)
    ? { locale, theme, returnTo }
    : null;
}
