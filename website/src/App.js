import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { signOut } from '@aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

// services
import AwsConfig from './services/Config';

// components
import StyledAuthenticator from './components/StyledAuthenticator';
import ItineraryCreationPage from './pages/ItineraryCreationPage';
import LoadingSpinner from './components/LoadingSpinner';

Amplify.configure(AwsConfig);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        await Amplify.Auth.currentAuthenticatedUser();
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  useEffect(() => {
    if (!loading) {
      navigate(isAuthenticated ? '/itinerary-creation' : '/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('selectedItineraryId');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  const handleAuthStateChange = (state) => {
    setIsAuthenticated(state === 'signedIn');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
            <Navigate to="/itinerary-creation" replace /> : 
            <StyledAuthenticator onStateChange={handleAuthStateChange} />
        } 
      />
      <Route 
        path="/itinerary-creation" 
        element={
          isAuthenticated ? 
            <ItineraryCreationPage onSignOut={handleSignOut} darkMode={darkMode} setDarkMode={setDarkMode} /> : 
            <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="*" 
        element={<Navigate to="/login" replace />} 
      />
    </Routes>
  );
}

export default App;