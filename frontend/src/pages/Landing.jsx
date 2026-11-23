import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import AdBanner from '../components/AdBanner';
import { formatMoney } from '../utils/money';
import InterstitialAd from '../components/InterstitialAd';

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-top">
        <Logo />
        <Link to="/login" className="btn btn-ghost">
          Log in
        </Link>
      </header>
      <main className="landing-main">
        <section className="landing-copy">
          <h1>Your money, in your pocket.</h1>
          <p className="lead">Send money to friends, pay your bills and add cash to your wallet in a few taps. Every payment is confirmed with your PIN.</p>
          <div className="landing-cta">
            <Link to="/register" className="btn btn-primary">
              Create your wallet
            </Link>
            <Link to="/login" className="btn btn-ghost">
              I already have one
            </Link>
          </div>
          <ul className="landing-points">
            <li>Send money using just a mobile number</li>
            <li>Pay electricity, water, telecom and more</li>
            <li>See a receipt for every transaction</li>
          </ul>
        </section>
        <div className="landing-art" aria-hidden="true">
          <div className="balance-card sample">
            <p className="balance-label">Wallet balance (sample)</p>
            <p className="balance-amount">{formatMoney('12480.50')}</p>
            <div className="sample-chips">
              <span>Send</span>
              <span>Cash In</span>
              <span>Pay Bills</span>
            </div>
          </div>
        </div>
      </main>
      <AdBanner slot="landing-banner" variant="banner" rotateMs={8000} />
      <InterstitialAd />
    </div>
  );
}
