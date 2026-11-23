import { useCallback, useEffect, useMemo, useState } from 'react';
import { WalletContext } from './walletContext';
import { useAuth } from './authContext';
import { getTransactions } from '../api/endpoints';
import { parseError } from '../utils/errors';

async function fetchTransactions() {
  try {
    const { data } = await getTransactions();
    return { items: Array.isArray(data) ? data : data?.results || [], error: '' };
  } catch (err) {
    return { items: null, error: parseError(err).message };
  }
}

export default function WalletProvider({ children }) {
  const { refreshMe } = useAuth();
  const [state, setState] = useState({ items: [], loading: true, error: '' });

  const apply = useCallback((result) => {
    setState((s) => ({ items: result.items ?? s.items, loading: false, error: result.error }));
  }, []);

  const reload = useCallback(async () => {
    apply(await fetchTransactions());
  }, [apply]);

  useEffect(() => {
    let cancelled = false;
    fetchTransactions().then((result) => {
      if (!cancelled) apply(result);
    });
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const retry = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    reload();
  }, [reload]);

  // After a successful money movement: refresh /me/ and the transaction list.
  const afterMoney = useCallback(() => {
    refreshMe();
    reload();
  }, [refreshMe, reload]);

  const value = useMemo(
    () => ({
      transactions: state.items,
      loading: state.loading,
      error: state.error,
      retry,
      afterMoney,
    }),
    [state, retry, afterMoney],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}