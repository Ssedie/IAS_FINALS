import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import AmountField from '../components/AmountField';
import Button from '../components/Button';
import ConfirmFlow from '../components/ConfirmFlow';
import Icon from '../components/Icon';
import { cashIn } from '../api/endpoints';
import { useWallet } from '../context/walletContext';
import { formatMoney, parseAmount, toAmountString, validateAmount } from '../utils/money';

const PRESETS = ['100', '500', '1000', '5000'];

export default function CashIn() {
  const navigate = useNavigate();
  const { afterMoney } = useWallet();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const onReview = (event) => {
    event.preventDefault();
    const problem = validateAmount(amount);
    setError(problem);
    if (!problem) setReviewing(true);
  };

  const submit = async () => {
    const { data } = await cashIn(toAmountString(parseAmount(amount)));
    afterMoney();
    return data;
  };

  return (
    <>
      <PageHeader title="Cash in" back="/home" />
      <p className="banner banner-info">
        <Icon name="alert" size={18} />
        <span>This is a simulation. No real payment gateway is connected, so no real money moves.</span>
      </p>
      <form onSubmit={onReview} noValidate className="stack">
        <div className="chips" role="group" aria-label="Quick amounts">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              className={`chip${parseAmount(amount) === parseAmount(p) ? ' on' : ''}`}
              aria-pressed={parseAmount(amount) === parseAmount(p)}
              onClick={() => {
                setAmount(p);
                setError('');
              }}
            >
              {formatMoney(p).replace('.00', '')}
            </button>
          ))}
        </div>
        <AmountField label="Custom amount" value={amount} onChange={setAmount} error={error} />
        <Button type="submit" className="btn-block">
          Review
        </Button>
      </form>

      {reviewing ? (
        <ConfirmFlow
          title="Review cash in"
          amountCents={parseAmount(amount)}
          rows={[{ label: 'Source', value: 'Cash In (simulated)' }]}
          requiresPin={false}
          submit={submit}
          onCancel={() => setReviewing(false)}
          onDone={() => navigate('/home')}
        />
      ) : null}
    </>
  );
}