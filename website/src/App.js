import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, fetchUserAttributes, signOut } from '@aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

// services
import AwsConfig from './services/Config';
import API from './services/API';

// components
import StyledAuthenticator from './components/StyledAuthenticator';
// import MainContent from './components/MainContent';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import ItineraryGrid from './components/ItineraryGrid';
import SideBar from './components/SideBar';

Amplify.configure(AwsConfig);

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dates, setDates] = useState({ start: '', end: '' });

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
        console.log('User is not authenticated. Redirecting to login...');
        await handleSignOut();
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
        <div className="flex flex-col h-screen">
        <Header credits={userInfo?.credits || 0}  userInfo={userInfo}/> {/* Use credits from userInfo */}
        <div className="flex flex-1 overflow-hidden">
          <SideBar 
            selectedCategories={selectedCategories} 
            setSelectedCategories={setSelectedCategories}
            dates={dates}
            setDates={setDates}
          />
          <main className="flex-1 overflow-auto p-6">
            <ItineraryGrid itinerary={userInfo?.initial_itinerary} />
          </main>
        </div>
      </div>
      )}
    </StyledAuthenticator>
  );
}

export default App;