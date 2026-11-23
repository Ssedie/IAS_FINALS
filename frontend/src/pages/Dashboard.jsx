import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import Card from '../components/Card';
import TxItem from '../components/TxItem';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import AdBanner from '../components/AdBanner';
import { TxSkeletons } from '../components/Skeleton';
import { useAuth } from '../context/authContext';
import { useWallet } from '../context/walletContext';
import { formatMoney } from '../utils/money';
import { greeting } from '../utils/date';
import InterstitialAd from '../components/InterstitialAd';

const ACTIONS = [
  { to: '/send', label: 'Send', icon: 'send' },
  { to: '/cash-in', label: 'Cash In', icon: 'plus' },
  { to: '/bills', label: 'Pay Bills', icon: 'bill' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { transactions, loading, error, retry } = useWallet();
  const [hidden, setHidden] = useState(false);
  const recent = transactions.slice(0, 5);

  return (
    <>
      <header className="greeting">
        <p className="muted">{greeting()}</p>
        <h1>Hi, {user.first_name}</h1>
      </header>

      <section className="balance-card" aria-label="Wallet balance">
        <div className="balance-top">
          <p className="balance-label">Wallet balance</p>
          <button
            type="button"
            className="balance-toggle"
            onClick={() => setHidden((h) => !h)}
            aria-pressed={hidden}
            aria-label={hidden ? 'Show balance' : 'Hide balance'}
          >
            <Icon name={hidden ? 'eyeOff' : 'eye'} />
          </button>
        </div>
        <p className="balance-amount">{hidden ? '₱ ••••••' : formatMoney(user.balance)}</p>
        <p className="balance-mobile">{user.mobile_number}</p>
      </section>

      <nav className="actions" aria-label="Quick actions">
        {ACTIONS.map((a) => (
          <Link key={a.to} to={a.to} className="action">
            <span className="action-icon">
              <Icon name={a.icon} />
            </span>
            <span>{a.label}</span>
          </Link>
        ))}
      </nav>

      <AdBanner slot="home-banner" variant="banner" rotateMs={8000} />

      <Card className="card-pad">
        <div className="section-head">
          <h2>Recent activity</h2>
          <Link to="/activity">See all</Link>
        </div>
        {loading ? (
          <TxSkeletons count={3} />
        ) : error ? (
          <EmptyState title="We couldn't load your activity" text={error} action={<Button variant="ghost" onClick={retry}>Try again</Button>} />
        ) : recent.length === 0 ? (
          <EmptyState
            title="No activity yet"
            text="Add money to your wallet to get started."
            action={
              <Link to="/cash-in" className="btn btn-primary">
                Cash in
              </Link>
            }
          />
        ) : (
          recent.map((tx) => <TxItem key={tx.reference} tx={tx} />)
        )}
      </Card>

      <AdBanner slot="home-strip" variant="strip" offset={2} />
      <InterstitialAd />
    </>
  );
}
