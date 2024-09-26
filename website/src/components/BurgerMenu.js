import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { signOut } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UpdatePasswordModal from './UpdatePasswordModal';

const BurgerMenu = ({ userInfo, previousItineraries, onSelectItinerary, selectedItineraryId }) => {
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
      navigate('/'); // Redirect to the home page or login page after sign out
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
        className="fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full"
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
            className="fixed inset-0 bg-white z-40 overflow-y-auto"
          >
            <div className="p-4 pt-16 flex flex-col h-full">
              <h2 className="text-2xl font-bold mb-4">User Info</h2>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Credits:</strong> {userInfo.credits}</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">Previous Itineraries</h2>
              <div className="flex-grow overflow-y-auto">
                {previousItineraries.map((itinerary) => (
                  <div
                    key={itinerary.itinerary_id}
                    className={`p-4 mb-4 rounded-lg cursor-pointer ${
                      selectedItineraryId === itinerary.itinerary_id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}
                    onClick={() => handleItineraryClick(itinerary)}
                  >
                    <p><strong>Destination:</strong> {itinerary.destination}</p>
                    <p><strong>Days:</strong> {itinerary.days}</p>
                    <p><strong>Budget:</strong> ${itinerary.budget}</p>
                    {itinerary.themes && itinerary.themes.length > 0 && (
                      <p><strong>Themes:</strong> {itinerary.themes.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
              {manageSubscriptionUrl && (
                  <button
                    onClick={handleManageSubscription}
                    className="mt-6 block w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Manage Subscription
                  </button>
                )}
              <button
                onClick={() => setIsUpdatePasswordModalOpen(true)}
                className="mt-4 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                Update Password
              </button>
              <button
                onClick={handleSignOut}
                className="mt-4 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <UpdatePasswordModal 
        isOpen={isUpdatePasswordModalOpen} 
        onClose={() => setIsUpdatePasswordModalOpen(false)} 
      />
    </div>
  );
};

export default BurgerMenu;