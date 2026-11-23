import Icon from './Icon';
import { formatMoney } from '../utils/money';
import { formatTime } from '../utils/date';
import { txLabel } from '../utils/tx';

const ICONS = { CASH_IN: 'plus', SEND: 'send', BILL_PAYMENT: 'bill' };

export default function TxItem({ tx, onClick }) {
  const incoming = tx.direction === 'in';
  const body = (
    <>
      <span className={`tx-icon ${incoming ? 'in' : 'out'}`}>
        <Icon name={ICONS[tx.type] || 'activity'} size={20} />
      </span>
      <span className="tx-main">
        <span className="tx-title">{tx.counterparty}</span>
        <span className="tx-sub">
          {txLabel(tx)}, {formatTime(tx.created_at)}
        </span>
      </span>
      <span className={`tx-amount ${incoming ? 'in' : 'out'}`}>
        {incoming ? '+' : '−'}
        {formatMoney(tx.amount)}
      </span>
    </>
  );
  return onClick ? (
    <button type="button" className="tx tx-btn" onClick={() => onClick(tx)}>
      {body}
    </button>
  ) : (
    <div className="tx">{body}</div>
  );
}