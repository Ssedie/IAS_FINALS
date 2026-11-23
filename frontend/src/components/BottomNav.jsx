import { NavLink } from 'react-router-dom';
import Icon from './Icon';
import Logo from './Logo';

const ITEMS = [
  { to: '/home', label: 'Home', icon: 'home' },
  { to: '/bills', label: 'Pay Bills', icon: 'bill' },
  { to: '/send', label: 'Send', icon: 'send' },
  { to: '/activity', label: 'Activity', icon: 'activity' },
  { to: '/profile', label: 'Profile', icon: 'user' },
];

export default function BottomNav() {
  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-brand">
        <Logo />
      </div>
      {ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to}>
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}