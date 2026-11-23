import { Component } from 'react';
import Button from './Button';
import Logo from './Logo';

export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="auth">
        <div className="auth-box center">
          <Logo />
          <h1>Something went wrong</h1>
          <p className="muted">The app hit an unexpected problem. Your money is safe. Reload to try again.</p>
          <Button onClick={() => window.location.assign('/')} className="btn-block">
            Reload PayWallet
          </Button>
        </div>
      </div>
    );
  }
}