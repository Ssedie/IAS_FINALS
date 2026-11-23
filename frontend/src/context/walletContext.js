import { createContext, useContext } from 'react';

export const WalletContext = createContext(null);
export const useWallet = () => useContext(WalletContext);