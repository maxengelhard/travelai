import React from 'react';

const categories = [
  { id: 'food', name: 'Food & Dining' },
  { id: 'culture', name: 'Cultural Activities' },
  { id: 'nature', name: 'Nature & Outdoors' },
  { id: 'adventure', name: 'Adventure & Sports' },
  { id: 'relaxation', name: 'Relaxation & Wellness' },
  { id: 'nightlife', name: 'Nightlife & Entertainment' },
];

const CategorySelector = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Select a Category</h2>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold py-2 px-4 rounded transition duration-300"
            >
              {category.name}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition duration-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CategorySelector;