import { useEffect, useRef, useState } from 'react';
import Sheet from './Sheet';
import PinPad from './PinPad';
import Button from './Button';
import Icon from './Icon';
import { formatCentavos, formatMoney } from '../utils/money';
import { formatDateTime } from '../utils/date';
import { parseError } from '../utils/errors';

const FEE_CENTAVOS = 0;

function Rows({ rows }) {
  return (
    <dl className="rows">
      {rows.map((row) => (
        <div className="row" key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Receipt({ result, onDone }) {
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  const tx = result.transaction;
  return (
    <div className="receipt" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
      <div className="receipt-inner">
        <span className="receipt-check">
          <Icon name="check" size={40} />
        </span>
        <h2 id="receipt-title" tabIndex={-1} ref={headingRef}>
          Transaction successful
        </h2>
        <p className="receipt-amount">{formatMoney(tx.amount)}</p>
        <dl className="rows rows-light">
          <div className="row">
            <dt>{tx.type === 'BILL_PAYMENT' ? 'Biller' : tx.type === 'CASH_IN' ? 'Source' : 'Recipient'}</dt>
            <dd>{tx.counterparty}</dd>
          </div>
          <div className="row">
            <dt>Reference number</dt>
            <dd>{tx.reference}</dd>
          </div>
          <div className="row">
            <dt>Date</dt>
            <dd>{formatDateTime(tx.created_at)}</dd>
          </div>
          <div className="row">
            <dt>New balance</dt>
            <dd>{formatMoney(result.balance)}</dd>
          </div>
        </dl>
        <Button variant="light" onClick={onDone} className="btn-block">
          Back to home
        </Button>
      </div>
    </div>
  );
}

/**
 * Review -> PIN -> Receipt.
 * submit(pin) must return the API response data ({ transaction, balance }) or throw an Axios error.
 */
export default function ConfirmFlow({ title = 'Review', amountCents, rows, requiresPin = true, submit, onCancel, onDone }) {
  const [stage, setStage] = useState('review');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const inFlight = useRef(false); // double-submit guard: the API has no idempotency key

  const run = async (pinValue) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const data = await submit(pinValue);
      setResult(data);
      setStage('receipt');
    } catch (err) {
      const parsed = parseError(err);
      setError(parsed.message);
      if (parsed.status !== 403) setStage('review'); // wrong PIN stays on the PIN step
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const confirmPin = () => {
    if (pin.length !== 4 || inFlight.current) return;
    const entered = pin;
    setPin(''); // clear the PIN from state immediately
    run(entered);
  };

  if (stage === 'receipt' && result) return <Receipt result={result} onDone={onDone} />;

  const details = [
    ...rows,
    { label: 'Amount', value: formatCentavos(amountCents) },
    { label: 'Fee', value: formatCentavos(FEE_CENTAVOS) },
    { label: 'Total', value: <strong>{formatCentavos(amountCents + FEE_CENTAVOS)}</strong> },
  ];

  return (
    <Sheet title={stage === 'pin' ? 'Enter your PIN' : title} onClose={onCancel} dismissible={!busy}>
      {stage === 'review' ? (
        <>
          <Rows rows={details} />
          {error ? (
            <p className="banner banner-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="sheet-actions">
            <Button variant="ghost" onClick={onCancel} disabled={busy}>
              Edit details
            </Button>
            <Button
              loading={busy}
              onClick={() => {
                setError('');
                if (requiresPin) setStage('pin');
                else run();
              }}
            >
              {requiresPin ? 'Continue' : 'Confirm'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="muted center">Confirm {formatCentavos(amountCents)} with your wallet PIN.</p>
          <PinPad value={pin} onChange={setPin} disabled={busy} />
          {error ? (
            <p className="banner banner-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="sheet-actions">
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setPin('');
                setError('');
                setStage('review');
              }}
            >
              Back
            </Button>
            <Button loading={busy} disabled={pin.length !== 4} onClick={confirmPin}>
              Confirm payment
            </Button>
          </div>
        </>
      )}
    </Sheet>
  );
}