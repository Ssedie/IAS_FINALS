import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <div className="auth-box">
        <Link to="/" aria-label="PayWallet home">
          <Logo />
        </Link>
        <h1>{title}</h1>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
        {children}
        {footer ? <p className="auth-footer">{footer}</p> : null}
      </div>
    </div>
  );
}