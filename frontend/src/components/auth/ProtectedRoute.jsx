import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../shared/Loader';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
