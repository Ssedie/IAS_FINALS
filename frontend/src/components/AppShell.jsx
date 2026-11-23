import { Outlet } from 'react-router-dom';
import WalletProvider from '../context/WalletProvider';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <WalletProvider>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <div className="shell">
        <BottomNav />
        <main className="main" id="main">
          <Outlet />
        </main>
      </div>
    </WalletProvider>
  );
}