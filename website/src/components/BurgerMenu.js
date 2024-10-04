import React, { useState } from 'react';
import { FaBars, FaTimes, FaUser, FaEnvelope, FaCoins, FaMapMarkedAlt, FaCreditCard, FaLock, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';
import { signOut } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UpdatePasswordModal from './UpdatePasswordModal';

const BurgerMenu = ({ userInfo, previousItineraries, onSelectItinerary, selectedItineraryId, darkMode, setDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleItineraryClick = (itinerary) => {
    localStorage.setItem('selectedItineraryId', itinerary.itinerary_id);
    onSelectItinerary(itinerary.itinerary_id);
    toggleMenu();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('selectedItineraryId');
      navigate('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const manageSubscriptionUrl = process.env.REACT_APP_STRIPE_MANAGE_URL;

  const handleManageSubscription = () => {
    localStorage.removeItem('selectedItineraryId');
    window.open(manageSubscriptionUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="md:hidden">
      <button 
        onClick={toggleMenu} 
        className={`fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center ${darkMode ? 'bg-indigo-700' : 'bg-indigo-600'} text-white rounded-full shadow-lg`}
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`fixed inset-0 ${darkMode ? 'bg-gray-900' : 'bg-white'} z-40 overflow-y-auto`}
          >
            <div className="p-6 pt-20 flex flex-col h-full">
              <div className={`space-y-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center space-x-3">
                  <FaUser className="text-indigo-500" size={20} />
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>User Info</h2>
                </div>
                <div className="flex items-center space-x-3 ml-6">
                  <FaEnvelope className="text-indigo-400" />
                  <p>{userInfo.email}</p>
                </div>
                <div className="flex items-center space-x-3 ml-6">
                  <FaCoins className="text-indigo-400" />
                  <p><strong>Credits:</strong> {userInfo.credits}</p>
                </div>
              </div>
              
              <div className="mt-10">
                <div className="flex items-center space-x-3 mb-4">
                  <FaMapMarkedAlt className="text-indigo-500" size={20} />
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Previous Itineraries</h2>
                </div>
                <div className="flex-grow overflow-y-auto space-y-4">
                  {previousItineraries.map((itinerary) => (
                    <div
                      key={itinerary.itinerary_id}
                      className={`p-4 rounded-lg cursor-pointer transition-colors duration-200 ${
                        selectedItineraryId === itinerary.itinerary_id 
                          ? darkMode ? 'bg-indigo-900' : 'bg-indigo-100'
                          : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                      } ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}
                      onClick={() => handleItineraryClick(itinerary)}
                    >
                      <p className="font-semibold">{itinerary.destination}</p>
                      <p className="text-sm"><strong>Days:</strong> {itinerary.days}</p>
                      <p className="text-sm"><strong>Budget:</strong> ${itinerary.budget}</p>
                      {itinerary.themes && itinerary.themes.length > 0 && (
                        <p className="text-sm"><strong>Themes:</strong> {itinerary.themes.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-auto space-y-4 pt-6">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-full flex items-center justify-center space-x-2 ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-400 hover:bg-blue-300'
                  } text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
                >
                  {darkMode ? <FaSun className="mr-2" /> : <FaMoon className="mr-2" />}
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                {manageSubscriptionUrl && (
                  <button
                    onClick={handleManageSubscription}
                    className={`w-full flex items-center justify-center space-x-2 ${darkMode ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
                  >
                    <FaCreditCard />
                    <span>Manage Subscription</span>
                  </button>
                )}
                <button
                  onClick={() => setIsUpdatePasswordModalOpen(true)}
                  className={`w-full flex items-center justify-center space-x-2 ${darkMode ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
                >
                  <FaLock />
                  <span>Update Password</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className={`w-full flex items-center justify-center space-x-2 ${darkMode ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'} text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out`}
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <UpdatePasswordModal 
        isOpen={isUpdatePasswordModalOpen} 
        onClose={() => setIsUpdatePasswordModalOpen(false)} 
        darkMode={darkMode}
      />
    </div>
  );
};

export default BurgerMenu;