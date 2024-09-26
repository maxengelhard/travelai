import React, { useState } from 'react';
import { signOut } from 'aws-amplify/auth';
import UpdatePasswordModal from './UpdatePasswordModal';

const UserSidebar = ({ isOpen, onClose, userInfo }) => {
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await signOut();
      onClose(); // Close the sidebar
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const manageSubscriptionUrl = process.env.REACT_APP_STRIPE_MANAGE_URL;

  return (
    <>
      <div className="fixed inset-0 overflow-hidden z-40">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
          <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
                <div className="px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-medium text-gray-900">User Profile</h2>
                    <button
                      onClick={onClose}
                      className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <span className="sr-only">Close panel</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-6 relative flex-1 px-4 sm:px-6">
                  {/* User info content */}
                  <div className="space-y-4">
                    <p><strong>Email:</strong> {userInfo.email}</p>
                    <p><strong>Credits:</strong> {userInfo.credits}</p>
                    {/* Add more user information as needed */}
                  </div>
                  
                  {/* Manage Subscription Link */}
                  {manageSubscriptionUrl && (
                    <a
                      href={manageSubscriptionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 block w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Manage Subscription
                    </a>
                  )}
                  
                  {/* Update Password Button */}
                  <button
                    onClick={() => setIsUpdatePasswordModalOpen(true)}
                    className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Update Password
                  </button>
                  
                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="mt-6 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <UpdatePasswordModal 
        isOpen={isUpdatePasswordModalOpen} 
        onClose={() => setIsUpdatePasswordModalOpen(false)} 
      />
    </>
  );
};

export default UserSidebar;