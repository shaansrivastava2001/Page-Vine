import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";

const COOKIE_USER = "userToken";
const COOKIE_TOKEN = "token";
const COOKIE_VERIFIED = "isVerified";

let logoutTimerId = null;

export function getToken() {
  return Cookies.get(COOKIE_TOKEN);
}

export function getUser() {
  const raw = Cookies.get(COOKIE_USER);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function getTokenExpiry() {
  const token = getToken();
  if (!token) return null;
  try {
    const { exp } = jwt_decode(token);
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  const expiresAt = getTokenExpiry();
  if (!expiresAt) return false;
  return Date.now() < expiresAt;
}

export function clearSession() {
  Cookies.remove(COOKIE_USER);
  Cookies.remove(COOKIE_TOKEN);
  Cookies.remove(COOKIE_VERIFIED);
  if (logoutTimerId) {
    clearTimeout(logoutTimerId);
    logoutTimerId = null;
  }
}

export function logout(reason) {
  clearSession();
  if (reason === "expired") {
    try {
      sessionStorage.setItem("auth:flash", "Your session has expired. Please log in again.");
    } catch {}
  }
  // Hard navigation so all in-memory state (timers, axios queues) resets cleanly.
  window.location.assign("/");
}

// Schedule an auto-logout when the active token's exp is reached.
// Safe to call multiple times — clears any prior timer first.
export function scheduleAutoLogout() {
  if (logoutTimerId) {
    clearTimeout(logoutTimerId);
    logoutTimerId = null;
  }
  const expiresAt = getTokenExpiry();
  if (!expiresAt) return;
  const ms = expiresAt - Date.now();
  if (ms <= 0) {
    logout("expired");
    return;
  }
  // Cap at ~24d to stay within setTimeout's 32-bit range.
  const safeMs = Math.min(ms, 2_147_000_000);
  logoutTimerId = setTimeout(() => logout("expired"), safeMs);
}

