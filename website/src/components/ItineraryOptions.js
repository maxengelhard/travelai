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
      ? 'bg-gray-800 hover:bg-gray-700 text-white' 
      : 'bg-gray-200 hover:bg-gray-300 text-black'
    } 
    font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg w-full md:w-1/2 text-center
  `;

  return (
    <div className={`flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4 p-6 ${
      darkMode ? 'bg-black border-b border-gray-800' : 'bg-white border-b border-gray-200'
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
            className={buttonClasses}
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