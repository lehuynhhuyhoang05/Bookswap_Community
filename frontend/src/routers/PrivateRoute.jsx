import { useAuth } from '../hooks/useAuth';
import AuthGuard from '../components/auth/AuthGuard';

const PrivateRoute = ({ children }) => {
  return <AuthGuard>{children}</AuthGuard>;
};

export default PrivateRoute;