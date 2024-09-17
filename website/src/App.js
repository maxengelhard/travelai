import React, { useState, useEffect, useCallback } from 'react';
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
import ItineraryOptions from './components/ItineraryOptions';

Amplify.configure(AwsConfig);

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dates, setDates] = useState({ start: '', end: '' });
  // const [additionalInput, setAdditionalInput] = useState('');

  const fetchUserInfo = useCallback(async () => {
    try {
      setLoading(true);
      await getCurrentUser();
      await fetchUserAttributes();
      const response = await API.get('user-status', { 
        useCache: false
      });
      setUserInfo(response.data.body);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user info:', error);
      if (error.name === 'UserUnAuthenticatedException' || error.name === 'NotAuthorizedException' || error.name === 'UserNotFoundException') {
        console.log('User is not authenticated. Redirecting to login...');
        await handleSignOut();
        setIsAuthenticated(false);
      } else {
        // Handle other types of errors without signing out
        setError('Failed to fetch user information. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  },[]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

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

  const handleAuthStateChange = (state) => {
    if (state === 'signedIn') {
      fetchUserInfo();
    }
  };

  // const handleAdditionalInputChange = (event) => {
  //   setAdditionalInput(event.target.value);
  // };

  // const handleSendAdditionalInput = async () => {
  //   try {
  //     // Here you would send the additionalInput to your API
  //     // For example:
  //     // await API.post('update-itinerary', { data: { additionalInput } });
  //     console.log('Sending additional input:', additionalInput);
  //     alert('Additional input sent successfully!');
  //     setAdditionalInput(''); // Clear the input after sending
  //   } catch (error) {
  //     console.error('Error sending additional input:', error);
  //     alert('Failed to send additional input. Please try again.');
  //   }
  // };

  const handleItineraryUpdate = (updatedItinerary) => {
    setUserInfo(prev => ({ ...prev, ...updatedItinerary }));
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
    <StyledAuthenticator onStateChange={handleAuthStateChange}>
      {({ signOut }) => (
        <div className="flex flex-col h-screen">
          <Header credits={userInfo?.credits || 0} userInfo={userInfo}/>
          <div className="flex flex-1 overflow-hidden">
            <SideBar 
              selectedCategories={selectedCategories} 
              setSelectedCategories={setSelectedCategories}
              dates={dates}
              setDates={setDates}
            />
            <main className="flex-1 overflow-auto p-6">
              <ItineraryOptions 
                userInfo={userInfo}
                onItineraryUpdate={handleItineraryUpdate}
              />
              {userInfo?.itinerary && (
                <ItineraryGrid itinerary={userInfo.itinerary} />
              )}
            </main>
          </div>
        </div>
      )}
    </StyledAuthenticator>
  );
}

export default App;