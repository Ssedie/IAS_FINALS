import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function NotFound() {
  return (
    <div className="auth">
      <div className="auth-box center">
        <Logo />
        <h1>Page not found</h1>
        <p className="muted">That page doesn't exist or has moved.</p>
        <Link to="/" className="btn btn-primary btn-block">
          Go to PayWallet
        </Link>
      </div>
    </div>
  );
}