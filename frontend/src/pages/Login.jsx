import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/authContext';
import { isValidMobile } from '../utils/mobile';
import { parseError } from '../utils/errors';

export default function Login() {
  const { login } = useAuth();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;
    const next = {};
    if (!isValidMobile(mobile)) next.mobile = 'Enter your mobile number, like 09171234567.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    setBanner('');
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await login(mobile, password);
    } catch (err) {
      setBanner(parseError(err).message);
      setPassword('');
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your wallet."
      footer={
        <>
          New to PayWallet? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="stack">
        {banner ? (
          <p className="banner banner-error" role="alert">
            {banner}
          </p>
        ) : null}
        <Input
          label="Mobile number"
          type="tel"
          inputMode="tel"
          autoComplete="username"
          placeholder="09171234567"
          value={mobile}
          error={errors.mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" loading={busy} className="btn-block">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}