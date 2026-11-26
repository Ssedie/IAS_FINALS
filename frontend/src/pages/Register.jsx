import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import AdBanner from '../components/AdBanner';
import InterstitialAd from '../components/InterstitialAd';
import { useAuth } from '../context/authContext';
import { isValidMobile } from '../utils/mobile';
import { parseError } from '../utils/errors';

const KNOWN = ['first_name', 'last_name', 'mobile_number', 'email', 'address', 'gender', 'job_title', 'password', 'pin'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADDRESS_MAX = 255;
const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'NON_BINARY', label: 'Non-binary' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];
const JOB_TITLES = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'SELF_EMPLOYED', label: 'Self-employed' },
  { value: 'BUSINESS_OWNER', label: 'Business owner' },
  { value: 'GOVERNMENT_EMPLOYEE', label: 'Government employee' },
  { value: 'OFW', label: 'Overseas Filipino worker (OFW)' },
  { value: 'UNEMPLOYED', label: 'Unemployed' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'OTHER', label: 'Other' },
];

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    mobile_number: '',
    email: '',
    address: '',
    gender: '',
    job_title: '',
    password: '',
    pin: '',
  });
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
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (!form.address.trim()) next.address = 'Enter your address.';
    else if (form.address.trim().length > ADDRESS_MAX) next.address = `Use ${ADDRESS_MAX} characters or fewer.`;
    if (!form.gender) next.gender = 'Select your gender.';
    if (!form.job_title) next.job_title = 'Select your occupation.';
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
        email: form.email.trim(),
        address: form.address.trim(),
        gender: form.gender,
        job_title: form.job_title,
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
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          error={errors.email}
          onChange={set('email')}
        />
        <Input
          label="Address"
          autoComplete="street-address"
          maxLength={ADDRESS_MAX}
          placeholder="Street, barangay, city, province"
          value={form.address}
          error={errors.address}
          onChange={set('address')}
        />
        <div className={`field${errors.gender ? ' has-error' : ''}`}>
          <label htmlFor="gender">Gender</label>
          <div className="control">
            <select id="gender" value={form.gender} onChange={set('gender')} aria-invalid={Boolean(errors.gender)}>
              <option value="" disabled>
                Select one
              </option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          {errors.gender ? (
            <p className="field-msg err" role="alert">
              {errors.gender}
            </p>
          ) : null}
        </div>
        <div className={`field${errors.job_title ? ' has-error' : ''}`}>
          <label htmlFor="job_title">Occupation</label>
          <div className="control">
            <select id="job_title" value={form.job_title} onChange={set('job_title')} aria-invalid={Boolean(errors.job_title)}>
              <option value="" disabled>
                Select one
              </option>
              {JOB_TITLES.map((j) => (
                <option key={j.value} value={j.value}>
                  {j.label}
                </option>
              ))}
            </select>
          </div>
          {errors.job_title ? (
            <p className="field-msg err" role="alert">
              {errors.job_title}
            </p>
          ) : null}
        </div>
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
      </form>
      <InterstitialAd />
    </AuthLayout>
  );
}
