/** Shared by the proxy (network boundary) and the server session helpers. */
export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-jd_session" : "jd_session";
