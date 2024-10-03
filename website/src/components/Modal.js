import React from 'react';

const Modal = ({ isOpen, onClose, children, darkMode }) => {
  if (!isOpen) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center" onClick={onClose}>
      <div 
        className={`relative w-full max-w-md m-auto flex-col flex rounded-lg shadow-lg ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`} 
        onClick={handleModalClick}
      >
        <span className="absolute top-0 right-0 p-4">
          <button 
            onClick={onClose} 
            className={`text-2xl font-bold ${
              darkMode 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            &times;
          </button>
        </span>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;