import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center" onClick={onClose}>
      <div className="relative bg-white w-full max-w-md m-auto flex-col flex rounded-lg shadow-lg" onClick={handleModalClick}>
        <span className="absolute top-0 right-0 p-4">
          <button onClick={onClose} className="text-2xl font-bold text-gray-500 hover:text-gray-700">&times;</button>
        </span>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;