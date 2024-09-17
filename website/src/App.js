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

Amplify.configure(AwsConfig);

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [additionalInput, setAdditionalInput] = useState('');

  const fetchUserInfo = useCallback(async () => {
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

  const handleAdditionalInputChange = (event) => {
    setAdditionalInput(event.target.value);
  };

  const handleSendAdditionalInput = async () => {
    try {
      // Here you would send the additionalInput to your API
      // For example:
      // await API.post('update-itinerary', { data: { additionalInput } });
      console.log('Sending additional input:', additionalInput);
      alert('Additional input sent successfully!');
      setAdditionalInput(''); // Clear the input after sending
    } catch (error) {
      console.error('Error sending additional input:', error);
      alert('Failed to send additional input. Please try again.');
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
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Edit Your Itinerary</h2>
                <div className="relative">
                  <textarea
                    className="w-full h-20 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none overflow-auto"
                    value={additionalInput}
                    onChange={handleAdditionalInputChange}
                    placeholder="Add/edit details of your itinerary here."
                  />
                  <div className="absolute bottom-0 right-0 mb-6 mr-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                      onClick={handleSendAdditionalInput}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
              <ItineraryGrid itinerary={userInfo?.itinerary} />
            </main>
          </div>
        </div>
      )}
    </StyledAuthenticator>
  );
}

export default App;