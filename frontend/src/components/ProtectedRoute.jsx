import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import Skeleton from './Skeleton';

export function SplashSkeleton() {
  return (
    <div className="main" role="status" aria-label="Loading">
      <Skeleton height={28} width="50%" />
      <Skeleton height={150} radius={20} style={{ marginTop: 20 }} />
      <Skeleton height={80} radius={16} style={{ marginTop: 16 }} />
    </div>
  );
}

export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <SplashSkeleton />;
  if (status !== 'authed') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <SplashSkeleton />;
  if (status === 'authed') return <Navigate to="/home" replace />;
  return <Outlet />;
}