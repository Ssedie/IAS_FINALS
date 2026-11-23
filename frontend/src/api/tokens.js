// Access token: memory only. Refresh token: sessionStorage (cleared when the tab closes).
const REFRESH_KEY = 'pw_refresh';

let accessToken = null;
let authFailureHandler = () => {};

export const getAccess = () => accessToken;
export const setAccess = (token) => {
  accessToken = token;
};

export function getRefresh() {
  try {
    return sessionStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setRefresh(token) {
  try {
    sessionStorage.setItem(REFRESH_KEY, token);
  } catch {
    /* storage unavailable: the user will log in again after a reload */
  }
}

export function clearTokens() {
  accessToken = null;
  try {
    sessionStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
}

export const setAuthFailureHandler = (handler) => {
  authFailureHandler = handler;
};
export const notifyAuthFailure = () => authFailureHandler();