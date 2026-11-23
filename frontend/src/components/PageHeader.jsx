import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function PageHeader({ title, back }) {
  return (
    <header className="page-header">
      {back ? (
        <Link to={back} className="icon-btn" aria-label="Back">
          <Icon name="back" />
        </Link>
      ) : null}
      <h1>{title}</h1>
    </header>
  );
}