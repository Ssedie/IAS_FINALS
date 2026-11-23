import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import TxItem from '../components/TxItem';
import Sheet from '../components/Sheet';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import AdBanner from '../components/AdBanner';
import { TxSkeletons } from '../components/Skeleton';
import { useWallet } from '../context/walletContext';
import { dayKey, dayLabel, formatDateTime } from '../utils/date';
import { formatMoney } from '../utils/money';
import { txLabel } from '../utils/tx';
import InterstitialAd from '../components/InterstitialAd';

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'CASH_IN', label: 'Cash in' },
  { id: 'SEND', label: 'Send' },
  { id: 'BILL_PAYMENT', label: 'Bills' },
];

const TYPE_NAMES = { CASH_IN: 'Cash in', SEND: 'Send money', BILL_PAYMENT: 'Bill payment' };

export default function Transactions() {
  const { transactions, loading, error, retry } = useWallet();
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);

  const groups = useMemo(() => {
    const visible = transactions.filter((tx) => filter === 'ALL' || tx.type === filter);
    const map = new Map();
    visible.forEach((tx) => {
      const key = dayKey(tx.created_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(tx);
    });
    return [...map.entries()];
  }, [transactions, filter]);

  return (
    <>
      <PageHeader title="Activity" />
      <div className="chips" role="group" aria-label="Filter by type">
      <InterstitialAd />
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={`chip${filter === f.id ? ' on' : ''}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <TxSkeletons count={6} />
      ) : error ? (
        <EmptyState title="We couldn't load your activity" text={error} action={<Button variant="ghost" onClick={retry}>Try again</Button>} />
      ) : groups.length === 0 ? (
        <EmptyState
          title={filter === 'ALL' ? 'No transactions yet' : 'Nothing here yet'}
          text={filter === 'ALL' ? 'Your payments and cash ins will appear here.' : 'No transactions of this type.'}
          action={
            filter === 'ALL' ? (
              <Link to="/cash-in" className="btn btn-primary">
                Cash in
              </Link>
            ) : null
          }
        />
      ) : (
        groups.map(([key, items], i) => (
          <Fragment key={key}>
            <section className="day">
              <h2 className="day-label">{dayLabel(key)}</h2>
              <div className="card card-pad">
                {items.map((tx) => (
                  <TxItem key={tx.reference} tx={tx} onClick={setSelected} />
                ))}
              </div>
            </section>
            {i % 3 === 0 ? <AdBanner slot={`activity-${i}`} variant="card" offset={i} /> : null}
          </Fragment>
        ))
      )}

      {selected ? (
        <Sheet title="Transaction details" onClose={() => setSelected(null)}>
          <p className={`detail-amount ${selected.direction === 'in' ? 'in' : 'out'}`}>
            {selected.direction === 'in' ? '+' : '−'}
            {formatMoney(selected.amount)}
          </p>
          <dl className="rows">
            <div className="row">
              <dt>Reference number</dt>
              <dd>{selected.reference}</dd>
            </div>
            <div className="row">
              <dt>Type</dt>
              <dd>
                {TYPE_NAMES[selected.type] || selected.type} ({txLabel(selected)})
              </dd>
            </div>
            <div className="row">
              <dt>{selected.type === 'BILL_PAYMENT' ? 'Biller' : selected.direction === 'in' ? 'From' : 'To'}</dt>
              <dd>{selected.counterparty}</dd>
            </div>
            {selected.note ? (
              <div className="row">
                <dt>Note</dt>
                <dd>{selected.note}</dd>
              </div>
            ) : null}
            <div className="row">
              <dt>Fee</dt>
              <dd>{formatMoney(selected.fee ?? 0)}</dd>
            </div>
            <div className="row">
              <dt>Date</dt>
              <dd>{formatDateTime(selected.created_at)}</dd>
            </div>
          </dl>
          <Button variant="ghost" className="btn-block" onClick={() => setSelected(null)}>
            Close
          </Button>
        </Sheet>
      ) : null}
    </>
  );
}
