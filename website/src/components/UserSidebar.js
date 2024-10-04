import React, { useState } from 'react';
import UpdatePasswordModal from './UpdatePasswordModal';
import { FaUser, FaEnvelope, FaCoins, FaCreditCard, FaLock, FaSignOutAlt } from 'react-icons/fa';

const UserSidebar = ({ isOpen, onClose, userInfo, onSignOut, darkMode }) => {
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await onSignOut();
      onClose();
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
    <>
      <div className="fixed inset-0 overflow-hidden z-40">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
          <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md">
              <div className={`h-full flex flex-col py-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl overflow-y-scroll`}>
                <div className="px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>User Profile</h2>
                    <button
                      onClick={onClose}
                      className={`rounded-md ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      <span className="sr-only">Close panel</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-8 relative flex-1 px-4 sm:px-6">
                  <div className={`space-y-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-indigo-500" />
                      <p className="text-lg"><strong>User Info</strong></p>
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
                  
                  <div className="mt-10 space-y-4">
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
                      onClick={handleLogout}
                      className={`w-full flex items-center justify-center space-x-2 ${darkMode ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'} text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out`}
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <UpdatePasswordModal 
        isOpen={isUpdatePasswordModalOpen} 
        onClose={() => setIsUpdatePasswordModalOpen(false)}
        darkMode={darkMode}
      />
    </>
  );
};

export default UserSidebar;