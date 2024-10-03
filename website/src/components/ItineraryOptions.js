import React, { useState } from 'react';
import Modal from './Modal';
import ItineraryForm from './ItineraryForm';

const ItineraryOptions = ({ userInfo, onItineraryUpdate, option, setOption, currentItinerary, darkMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOptionClick = (selectedOption) => {
    setOption(selectedOption);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOption(null);
  };

  const buttonClasses = `
    ${darkMode 
      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
      : 'bg-blue-500 hover:bg-blue-600 text-white'
    } 
    font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg w-full md:w-1/2 text-center
  `;

  const editButtonClasses = `
    ${darkMode 
      ? 'bg-green-600 hover:bg-green-700 text-white' 
      : 'bg-green-500 hover:bg-green-600 text-white'
    } 
    font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg w-full md:w-1/2 text-center
  `;

  return (
    <div className={`flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4 p-6 ${
      darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-100 border-b border-gray-300'
    }`}>
      {currentItinerary ? (
        <>
          <button
            onClick={() => handleOptionClick('create')}
            className={buttonClasses}
          >
            Create New Itinerary
          </button>
          <button
            onClick={() => handleOptionClick('edit')}
            className={editButtonClasses}
          >
            Edit Existing Itinerary
          </button>
        </>
      ) : (
        <button
          onClick={() => handleOptionClick('create')}
          className={`${buttonClasses} w-full md:w-1/2`}
        >
          Create New Itinerary
        </button>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} darkMode={darkMode}>
        <ItineraryForm
          userInfo={userInfo}
          onItineraryUpdate={onItineraryUpdate}
          option={option}
          onClose={handleCloseModal}
          currentItinerary={currentItinerary}
          darkMode={darkMode}
        />
      </Modal>
    </div>
  );
};

export default ItineraryOptions;