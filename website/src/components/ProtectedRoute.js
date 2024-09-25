import { Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useUserPlan } from '../services/UserPlan';

const ProtectedRoute = ({ children, requiredPlan }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const { plan, loading } = useUserPlan();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (plan !== requiredPlan) return <Navigate to="/upgrade" />;

  return children;
};

export default ProtectedRoute;