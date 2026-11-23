import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Input from '../components/Input';
import AmountField from '../components/AmountField';
import Button from '../components/Button';
import ConfirmFlow from '../components/ConfirmFlow';
import AdBanner from '../components/AdBanner';
import { sendMoney } from '../api/endpoints';
import { useAuth } from '../context/authContext';
import { useWallet } from '../context/walletContext';
import { isValidMobile, normalizeMobile } from '../utils/mobile';
import { parseAmount, toAmountString, validateAmount } from '../utils/money';
import InterstitialAd from '../components/InterstitialAd';

const NOTE_MAX = 140;

export default function Send() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { afterMoney } = useWallet();
  const [form, setForm] = useState({ mobile: '', amount: '', note: '' });
  const [errors, setErrors] = useState({});
  const [reviewing, setReviewing] = useState(false);

  const update = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const onReview = (event) => {
    event.preventDefault();
    const next = {};
    if (!isValidMobile(form.mobile)) {
      next.mobile = 'Enter a valid mobile number, like 09171234567.';
    } else if (normalizeMobile(form.mobile) === normalizeMobile(user.mobile_number)) {
      next.mobile = "You can't send money to your own number.";
    }
    const amountError = validateAmount(form.amount);
    if (amountError) next.amount = amountError;
    setErrors(next);
    if (Object.keys(next).length === 0) setReviewing(true);
  };

  const submit = async (pin) => {
    const body = {
      mobile_number: normalizeMobile(form.mobile),
      amount: toAmountString(parseAmount(form.amount)),
      pin,
    };
    const note = form.note.trim();
    if (note) body.note = note;
    const { data } = await sendMoney(body);
    afterMoney();
    return data;
  };

  const rows = [{ label: 'Recipient', value: normalizeMobile(form.mobile) }];
  if (form.note.trim()) rows.push({ label: 'Note', value: form.note.trim() });

  return (
    <>
      <PageHeader title="Send money" />
      <form onSubmit={onReview} noValidate className="stack">
        <Input
          label="Recipient's mobile number"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          placeholder="09181234567"
          value={form.mobile}
          error={errors.mobile}
          onChange={(e) => update('mobile')(e.target.value)}
        />
        <AmountField value={form.amount} onChange={update('amount')} error={errors.amount} />
        <Input
          label="Note (optional)"
          maxLength={NOTE_MAX}
          autoComplete="off"
          hint={`${form.note.length}/${NOTE_MAX}`}
          value={form.note}
          onChange={(e) => update('note')(e.target.value)}
        />
        <Button type="submit" className="btn-block">
          Review
        </Button>
      </form>

      <AdBanner slot="send-banner" variant="banner" />
      <InterstitialAd />

      {reviewing ? (
        <ConfirmFlow
          title="Review transfer"
          amountCents={parseAmount(form.amount)}
          rows={rows}
          submit={submit}
          onCancel={() => setReviewing(false)}
          onDone={() => navigate('/home')}
        />
      ) : null}
    </>
  );
}
