import React, { useState, useEffect, useCallback } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, fetchUserAttributes, signOut } from '@aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

// services
import AwsConfig from './services/Config';
import API from './services/API';

// components
import StyledAuthenticator from './components/StyledAuthenticator';
import BurgerMenu from './components/BurgerMenu';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import ItineraryGrid from './components/ItineraryGrid';
import SideBar from './components/SideBar';
import ItineraryOptions from './components/ItineraryOptions';
import UserSidebar from './components/UserSidebar';

Amplify.configure(AwsConfig);

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  // const [selectedCategories, setSelectedCategories] = useState([]);
  // const [dates, setDates] = useState({ start: '', end: '' });
  const [option, setOption] = useState(null);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [previousItineraries, setPreviousItineraries] = useState([]);
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);
  // const [additionalInput, setAdditionalInput] = useState('');

  const fetchUserInfo = useCallback(async (itineraryId = null) => {
    try {
      setLoading(true);
      await getCurrentUser();
      await fetchUserAttributes();
      const cachedItineraryId = localStorage.getItem('selectedItineraryId');
      const queryParams = cachedItineraryId ? { itinerary_id: cachedItineraryId } : {};
      const response = await API.get('user-status', { 
        queryParams: queryParams,
        useCache: false
      });
      setUserInfo(response.data.body);
      if (response.data.body.itinerary) {
        setSelectedItinerary({
          itinerary_id: response.data.body.itinerary_id,
          ...response.data.body
        });
      }
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

  // fetch previous itineraries
  const fetchPreviousItineraries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('user-itineraries', { useCache: false });
      setPreviousItineraries(response.data.body);
    } catch (err) {
      console.error('Error fetching previous itineraries:', err);
      setError('Failed to load previous itineraries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserInfo();
      fetchPreviousItineraries();
    }
  }, [isAuthenticated, fetchUserInfo, fetchPreviousItineraries]);


  // const handleCategoryChange = (category) => {
  //   setSelectedCategories(prev => 
  //     prev.includes(category) 
  //       ? prev.filter(c => c !== category)
  //       : [...prev, category]
  //   );
  // };

  

  const handleSelectItinerary = async (itineraryId) => {
    localStorage.setItem('selectedItineraryId', itineraryId);
    await fetchUserInfo(itineraryId);
  };

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
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setUserInfo(null);
      setSelectedItinerary(null);
      setPreviousItineraries([]);
    }
  };

  const handleUserButtonClick = () => {
    setIsUserSidebarOpen(true);
  };

  const handleCloseUserSidebar = () => {
    setIsUserSidebarOpen(false);
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

  const handleItineraryUpdate = useCallback(({ userStatus, userItineraries }) => {
    setUserInfo(userStatus);
    setPreviousItineraries(userItineraries);
    setSelectedItinerary(userStatus.itinerary ? {
      itinerary_id: userStatus.itinerary_id,
      ...userStatus
    } : null);
    setOption(null);
  }, []);



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
          <Header 
            credits={userInfo?.credits || 0} 
            userInfo={userInfo}
            onUserButtonClick={handleUserButtonClick}
          />
          <div className="flex flex-1 overflow-hidden">
            <div className="hidden md:block">
              <SideBar 
                onSelectItinerary={handleSelectItinerary}
                selectedItineraryId={selectedItinerary?.itinerary_id}
                previousItineraries={previousItineraries}
              />
            </div>
            <BurgerMenu 
              userInfo={userInfo}
              previousItineraries={previousItineraries}
              onSelectItinerary={handleSelectItinerary}
              selectedItineraryId={selectedItinerary?.itinerary_id}
              onUserButtonClick={handleUserButtonClick}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-shrink-0">
                <ItineraryOptions 
                  userInfo={userInfo}
                  onItineraryUpdate={handleItineraryUpdate}
                  option={option}
                  setOption={setOption}
                  currentItinerary={selectedItinerary}
                />
              </div>
              <div className="flex-1 overflow-auto p-4">
                {selectedItinerary && (
                  <ItineraryGrid itinerary={selectedItinerary.itinerary} />
                )}
              </div>
            </main>
            <UserSidebar 
              isOpen={isUserSidebarOpen}
              onClose={handleCloseUserSidebar}
              userInfo={userInfo}
            />
          </div>
        </div>
      )}
    </StyledAuthenticator>
  );
}

export default App;