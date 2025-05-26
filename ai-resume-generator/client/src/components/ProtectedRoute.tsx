import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { Loader } from './Loader';

interface ProtectedRouteProps {
  roles?: string[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  roles = [],
  children 
}) => {
  const { isAuthenticated, isLoading, user } = useStore();
  const location = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  // If user is not authenticated, redirect to login with the return URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={ { from: location } } replace />;
  }

  // Check if user has required roles
  if (roles.length > 0 && (!user || !user.role || !roles.includes(user.role))) {
    // User is authenticated but doesn't have the required role
    return <Navigate to="/unauthorized" state={ { from: location } } replace />;
  }


  // If user is authenticated and has required roles, render the children or outlet
  return children ? <>{children}</> : <Outlet />;
};

// Export default for backward compatibility
export default ProtectedRoute;
