import { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';

export const useUserPlan = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPlan = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const response = await fetch(`/api/user-plan?email=${user.attributes.email}`);
        const data = await response.json();
        setPlan(data.plan);
      } catch (error) {
        console.error('Error checking plan:', error);
      }
      setLoading(false);
    };

    checkPlan();
  }, []);

  return { plan, loading };
};