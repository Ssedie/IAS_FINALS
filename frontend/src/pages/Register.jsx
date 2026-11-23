import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import AdBanner from '../components/AdBanner';
import { useAuth } from '../context/authContext';
import { isValidMobile } from '../utils/mobile';
import { parseError } from '../utils/errors';
import InterstitialAd from '../components/InterstitialAd';

const KNOWN = ['first_name', 'last_name', 'mobile_number', 'password', 'pin'];

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', mobile_number: '', password: '', pin: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (event) => {
    const value = key === 'pin' ? event.target.value.replace(/\D/g, '').slice(0, 4) : event.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;
    const next = {};
    if (!form.first_name.trim()) next.first_name = 'Enter your first name.';
    if (!form.last_name.trim()) next.last_name = 'Enter your last name.';
    if (!isValidMobile(form.mobile_number)) next.mobile_number = 'Use 09XXXXXXXXX or +639XXXXXXXXX.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (!/^\d{4}$/.test(form.pin)) next.pin = 'Your PIN must be exactly 4 digits.';
    setErrors(next);
    setBanner('');
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await register({
        mobile_number: form.mobile_number.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        password: form.password,
        pin: form.pin,
      });
    } catch (err) {
      const parsed = parseError(err);
      setErrors(parsed.fields);
      const hasFieldError = Object.keys(parsed.fields).some((k) => KNOWN.includes(k));
      setBanner(hasFieldError ? '' : parsed.message);
      setForm((f) => ({ ...f, password: '', pin: '' }));
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create your wallet"
      subtitle="It takes about a minute."
      footer={
        <>
          Already registered? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="stack">
        {banner ? (
          <p className="banner banner-error" role="alert">
            {banner}
          </p>
        ) : null}
        <div className="grid-2">
          <Input label="First name" autoComplete="given-name" value={form.first_name} error={errors.first_name} onChange={set('first_name')} />
          <Input label="Last name" autoComplete="family-name" value={form.last_name} error={errors.last_name} onChange={set('last_name')} />
        </div>
        <Input
          label="Mobile number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="09171234567"
          value={form.mobile_number}
          error={errors.mobile_number}
          onChange={set('mobile_number')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          value={form.password}
          error={errors.password}
          onChange={set('password')}
        />
        <Input
          label="4-digit PIN"
          type="password"
          inputMode="numeric"
          maxLength={4}
          autoComplete="off"
          hint="You will enter this to confirm every payment."
          value={form.pin}
          error={errors.pin}
          onChange={set('pin')}
        />
        <Button type="submit" loading={busy} className="btn-block">
          Create account
        </Button>
        <AdBanner slot="register-strip" variant="strip" />
      <InterstitialAd />
      </form>
    </AuthLayout>
  );
}
