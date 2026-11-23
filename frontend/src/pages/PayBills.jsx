import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Input from '../components/Input';
import AmountField from '../components/AmountField';
import Button from '../components/Button';
import ConfirmFlow from '../components/ConfirmFlow';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import AdBanner from '../components/AdBanner';
import { getBillers, payBill } from '../api/endpoints';
import { useWallet } from '../context/walletContext';
import { parseAmount, toAmountString, validateAmount } from '../utils/money';
import { parseError } from '../utils/errors';
import InterstitialAd from '../components/InterstitialAd';

const CATEGORY_LABELS = {
  ELECTRICITY: 'Electricity',
  WATER: 'Water',
  TELCO: 'Telecom and internet',
  INSURANCE: 'Insurance',
  GOVERNMENT: 'Government',
  OTHER: 'Other',
};
const ACCOUNT_MAX = 50;

async function fetchBillers() {
  try {
    const { data } = await getBillers();
    return { items: Array.isArray(data) ? data : data?.results || [], loading: false, error: '' };
  } catch (err) {
    return { items: [], loading: false, error: parseError(err).message };
  }
}

export default function PayBills() {
  const navigate = useNavigate();
  const { afterMoney } = useWallet();
  const [billers, setBillers] = useState({ items: [], loading: true, error: '' });
  const [billerId, setBillerId] = useState(null);
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchBillers().then((result) => {
      if (!cancelled) setBillers(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const retry = async () => {
    setBillers({ items: [], loading: true, error: '' });
    setBillers(await fetchBillers());
  };

  const grouped = Object.keys(CATEGORY_LABELS)
    .map((key) => ({ key, items: billers.items.filter((b) => (CATEGORY_LABELS[b.category] ? b.category : 'OTHER') === key) }))
    .filter((g) => g.items.length > 0);

  const selected = billers.items.find((b) => b.id === billerId);

  const onReview = (event) => {
    event.preventDefault();
    const next = {};
    if (!selected) next.biller = 'Choose a biller.';
    const ref = account.trim();
    if (!ref) next.account = 'Enter the account number.';
    else if (ref.length > ACCOUNT_MAX) next.account = `Use ${ACCOUNT_MAX} characters or fewer.`;
    const amountError = validateAmount(amount);
    if (amountError) next.amount = amountError;
    setErrors(next);
    if (Object.keys(next).length === 0) setReviewing(true);
  };

  const submit = async (pin) => {
    const { data } = await payBill({
      biller_id: selected.id,
      account_ref: account.trim(),
      amount: toAmountString(parseAmount(amount)),
      pin,
    });
    afterMoney();
    return data;
  };

  return (
    <>
      <PageHeader title="Pay bills" />
      <AdBanner slot="bills-banner" variant="banner" />
      <InterstitialAd />
      {billers.loading ? (
        <div role="status" aria-label="Loading billers" className="stack">
          <Skeleton height={20} width="40%" />
          <Skeleton height={56} radius={16} />
          <Skeleton height={56} radius={16} />
        </div>
      ) : billers.error ? (
        <EmptyState title="We couldn't load billers" text={billers.error} action={<Button variant="ghost" onClick={retry}>Try again</Button>} />
      ) : billers.items.length === 0 ? (
        <EmptyState title="No billers available" text="Billers will show up here once they are added." />
      ) : (
        <form onSubmit={onReview} noValidate className="stack">
          <div className="stack-sm">
            {grouped.map((group) => (
              <fieldset key={group.key} className="biller-group">
                <legend>{CATEGORY_LABELS[group.key]}</legend>
                {group.items.map((b) => (
                  <label key={b.id} className={`biller${billerId === b.id ? ' on' : ''}`}>
                    <input
                      type="radio"
                      name="biller"
                      value={b.id}
                      checked={billerId === b.id}
                      onChange={() => {
                        setBillerId(b.id);
                        setErrors((e) => ({ ...e, biller: undefined }));
                      }}
                    />
                    <span>{b.name}</span>
                  </label>
                ))}
              </fieldset>
            ))}
            {errors.biller ? (
              <p className="field-msg err" role="alert">
                {errors.biller}
              </p>
            ) : null}
          </div>
          <Input
            label="Account number"
            maxLength={ACCOUNT_MAX}
            autoComplete="off"
            value={account}
            error={errors.account}
            onChange={(e) => setAccount(e.target.value)}
          />
          <AmountField value={amount} onChange={setAmount} error={errors.amount} />
          <Button type="submit" className="btn-block">
            Review
          </Button>
        </form>
      )}

      {reviewing && selected ? (
        <ConfirmFlow
          title="Review payment"
          amountCents={parseAmount(amount)}
          rows={[
            { label: 'Biller', value: selected.name },
            { label: 'Account number', value: account.trim() },
          ]}
          submit={submit}
          onCancel={() => setReviewing(false)}
          onDone={() => navigate('/home')}
        />
      ) : null}
    </>
  );
}
