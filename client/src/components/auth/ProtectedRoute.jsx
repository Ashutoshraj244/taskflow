import { Navigate } from 'react-router-dom';
import useAuthStore from '../../context/authStore';
import Spinner from '../ui/Spinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-0">
        <Spinner size={6} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
