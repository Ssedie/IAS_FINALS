import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { useAuth } from '../context/authContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();

  const onLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      <PageHeader title="Profile" />
      <Card className="card-pad profile">
        <span className="avatar" aria-hidden="true">
          {initials}
        </span>
        <div>
          <p className="profile-name">
            {user.first_name} {user.last_name}
          </p>
          <p className="muted">{user.mobile_number}</p>
        </div>
      </Card>
      <p className="banner banner-info">
        <Icon name="shield" size={18} />
        <span>You are logged out automatically after 5 minutes without activity. Never share your PIN or password.</span>
      </p>
      <Button variant="danger" className="btn-block" onClick={onLogout}>
        <Icon name="logout" size={18} /> Log out
      </Button>
    </>
  );
}