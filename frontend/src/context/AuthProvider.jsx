import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from './authContext';
import { useToast } from './toastContext';
import { getMe, loginRequest, registerRequest } from '../api/endpoints';
import { refreshAccess } from '../api/client';
import { clearTokens, getRefresh, setAccess, setAuthFailureHandler, setRefresh } from '../api/tokens';
import { isValidMobile, normalizeMobile } from '../utils/mobile';

const IDLE_LIMIT_MS = 5 * 60 * 1000;
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'wheel'];

export default function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (getRefresh() ? 'loading' : 'anon'));
  const idleTimer = useRef(null);

  const clearSession = useCallback(() => {
    clearTokens();
    setUser(null);
    setStatus('anon');
  }, []);

  const loadMe = useCallback(async () => {
    const { data } = await getMe();
    setUser(data);
    return data;
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      await loadMe();
    } catch {
      /* keep the last known balance; the next action will surface any real problem */
    }
  }, [loadMe]);

  // Called by the Axios interceptor when the refresh token is rejected.
  useEffect(() => {
    setAuthFailureHandler(() => {
      clearSession();
      toast.error('Your session expired. Please log in again.');
    });
  }, [clearSession, toast]);

  // Restore the session after a page reload.
  useEffect(() => {
    if (!getRefresh()) return undefined;
    let cancelled = false;
    (async () => {
      try {
        await refreshAccess();
        const { data } = await getMe();
        if (!cancelled) {
          setUser(data);
          setStatus('authed');
        }
      } catch (err) {
        if (cancelled) return;
        if (err.response) clearSession();
        else setStatus('anon'); // API unreachable: keep the token, show login
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // Auto-logout after about 5 minutes without activity.
  useEffect(() => {
    if (status !== 'authed') return undefined;
    const arm = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        clearSession();
        toast.info('You were logged out after 5 minutes of inactivity.');
      }, IDLE_LIMIT_MS);
    };
    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, arm, { passive: true }));
    arm();
    return () => {
      ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, arm));
      clearTimeout(idleTimer.current);
    };
  }, [status, clearSession, toast]);

  const startSession = useCallback(
    async (tokens) => {
      setAccess(tokens.access);
      setRefresh(tokens.refresh);
      try {
        await loadMe();
        setStatus('authed');
      } catch (err) {
        clearTokens();
        throw err;
      }
    },
    [loadMe],
  );

  const login = useCallback(
    async (mobile, password) => {
      // The login endpoint does not normalize the number, so we do it here.
      const username = isValidMobile(mobile) ? normalizeMobile(mobile) : mobile.trim();
      const { data } = await loginRequest({ username, password });
      await startSession(data);
    },
    [startSession],
  );

  const register = useCallback(
    async (fields) => {
      const { data } = await registerRequest(fields);
      await startSession(data);
    },
    [startSession],
  );

  const value = useMemo(
    () => ({ user, status, login, register, logout: clearSession, refreshMe }),
    [user, status, login, register, clearSession, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}