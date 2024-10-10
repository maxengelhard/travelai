import React, { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';
import API from '../services/API';
import { useNavigate } from 'react-router-dom';


import Header from '../components/Header';
import SideBar from '../components/SideBar';
import BurgerMenu from '../components/BurgerMenu';
import ItineraryOptions from '../components/ItineraryOptions';
import ItineraryGrid from '../components/ItineraryGrid';
import UserSidebar from '../components/UserSidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ChatButton from '../components/ChatButton';  // Add this import


function ItineraryCreationPage({ onSignOut, darkMode, setDarkMode }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [option, setOption] = useState(null);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [previousItineraries, setPreviousItineraries] = useState([]);
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const handleAuthError = useCallback(async () => {
    await onSignOut();
    navigate('/login');
  }, [onSignOut, navigate]);

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
      if (response.data.body.content) {
        setSelectedItinerary({
          itinerary_id: response.data.body.itinerary_id,
          ...response.data.body
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      await handleAuthError();
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  const fetchPreviousItineraries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('user-itineraries', { useCache: false });
      setPreviousItineraries(response.data.body);
    } catch (err) {
      console.error('Error fetching previous itineraries:', err);
      await handleAuthError();
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchUserInfo();
        await fetchPreviousItineraries();
      } catch (error) {
        console.error('Error fetching data:', error);
        await handleAuthError();
      }
    };

    fetchData();
  }, [fetchUserInfo, fetchPreviousItineraries, handleAuthError]);


  const handleSelectItinerary = async (itineraryId) => {
    localStorage.setItem('selectedItineraryId', itineraryId);
    await fetchUserInfo(itineraryId);
  };

  const handleUserButtonClick = () => {
    setIsUserSidebarOpen(true);
  };

  const handleCloseUserSidebar = () => {
    setIsUserSidebarOpen(false);
  };

  const handleItineraryUpdate = useCallback(({ userStatus, userItineraries, creditsUsed }) => {
    setUserInfo(prevUserInfo => ({
      ...prevUserInfo,
      ...userStatus,
    }));
    setPreviousItineraries(userItineraries);
    setSelectedItinerary(userStatus.content ? {
      ...userStatus
    } : null);
    setOption(null);
  }, []);

  if (loading) {
    return <LoadingSpinner darkMode={darkMode} />
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <Header 
        credits={userInfo?.credits || 0} 
        userInfo={userInfo}
        onUserButtonClick={handleUserButtonClick}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <SideBar 
            onSelectItinerary={handleSelectItinerary}
            selectedItineraryId={selectedItinerary?.itinerary_id}
            previousItineraries={previousItineraries}
            darkMode={darkMode}
          />
        </div>
        <BurgerMenu 
          userInfo={userInfo}
          previousItineraries={previousItineraries}
          onSelectItinerary={handleSelectItinerary}
          selectedItineraryId={selectedItinerary?.itinerary_id}
          onUserButtonClick={handleUserButtonClick}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <main className={`flex-1 flex flex-col overflow-hidden ${darkMode ? 'bg-black' : 'bg-white'}`}>
          <div className="flex-shrink-0">
            <ItineraryOptions 
              userInfo={userInfo}
              onItineraryUpdate={handleItineraryUpdate}
              option={option}
              setOption={setOption}
              currentItinerary={selectedItinerary}
              darkMode={darkMode}
            />
          </div>
          <div className="flex-1 overflow-auto">
            {selectedItinerary && (
              <ItineraryGrid destination={selectedItinerary.destination} itinerary={selectedItinerary.content} darkMode={darkMode}/>
            )}
          </div>
        </main>
        <UserSidebar 
          isOpen={isUserSidebarOpen}
          onClose={handleCloseUserSidebar}
          userInfo={userInfo}
          onSignOut={onSignOut}
          darkMode={darkMode}
        />
      </div>
      <ChatButton darkMode={darkMode} />
    </div>
  );
}

export default ItineraryCreationPage;