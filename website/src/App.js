import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, fetchUserAttributes, signOut } from '@aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

// services
import AwsConfig from './services/Config';
import API from './services/API';

// components
import StyledAuthenticator from './components/StyledAuthenticator';
import SideBar from './components/SideBar';
import MainContent from './components/MainContent';
import LoadingSpinner from './components/LoadingSpinner';

Amplify.configure(AwsConfig);

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        await getCurrentUser();
        const attributes = await fetchUserAttributes();
        const response = await API.post('user-status', { 
          data: { email: attributes.email },
          useCache: false
        });
        setUserInfo(response.data.body);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error fetching user info:', error);
        setError('Failed to fetch user information');
        if (error.name === 'UserUnAuthenticatedException') {
          console.log('User is not authenticated. Redirecting to login...');
          await handleSignOut();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsAuthenticated(false);
      setUserInfo(null);
    }
  };

  if (!isAuthenticated) {
    return <StyledAuthenticator />;
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <StyledAuthenticator>
      {({ signOut }) => (
        <div className="flex h-screen bg-gray-100">
          {userInfo && <SideBar userInfo={userInfo} />}
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white shadow-md">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">TripJourney</h1>
                <button
                  onClick={signOut}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Sign out
                </button>
              </div>
            </header>
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
              <MainContent userInfo={userInfo} />
            </main>
          </div>
        </div>
      )}
    </StyledAuthenticator>
  );
}

export default App;