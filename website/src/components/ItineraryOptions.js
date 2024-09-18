import React, { useState } from 'react';
import Modal from './Modal';
import ItineraryForm from './ItineraryForm'; // Assume this is your form component

const ItineraryOptions = ({ userInfo, onItineraryUpdate, option, setOption }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOptionClick = (selectedOption) => {
    setOption(selectedOption);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOption(null);
  };

  return (
    <div className="flex justify-center space-x-4 p-4">
      <button
        onClick={() => handleOptionClick('create')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Create New Itinerary
      </button>
      <button
        onClick={() => handleOptionClick('edit')}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Edit Existing Itinerary
      </button>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ItineraryForm
          userInfo={userInfo}
          onItineraryUpdate={onItineraryUpdate}
          option={option}
          onClose={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default ItineraryOptions;