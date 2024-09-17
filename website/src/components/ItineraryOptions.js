import React, { useState } from 'react';
import API from '../services/API';

const ItineraryOptions = ({ userInfo, onItineraryUpdate }) => {
  const [option, setOption] = useState(null);
  const [formData, setFormData] = useState({
    destination: '',
    days: '',
    budget: '',
    themes: [],
    prompt: '',
  });

  const handleOptionSelect = (selectedOption) => {
    setOption(selectedOption);
    if (selectedOption === 'edit' && userInfo.themes) {
      setFormData(prev => ({ ...prev, themes: userInfo.themes }));
    }
  };

  const handleClose = () => {
    setOption(null);
    setFormData({
      destination: '',
      days: '',
      budget: '',
      themes: [],
      prompt: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (theme) => {
    setFormData(prev => ({
      ...prev,
      themes: prev.themes.includes(theme)
        ? prev.themes.filter(t => t !== theme)
        : [...prev.themes, theme]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (option === 'new') {
        response = await API.post('create-itinerary', { body: formData });
      } else {
        response = await API.post('update-itinerary', {
          body: {
            itinerary_id: userInfo.itinerary_id,
            themes: formData.themes,
            prompt: formData.prompt
          }
        });
      }
      onItineraryUpdate(response.data.body);
      handleClose();
    } catch (error) {
      console.error('Error creating/updating itinerary:', error);
    }
  };

  const themes = ['Food', 'Culture', 'Nature', 'Adventure', 'Relaxation'];

  if (!option) {
    return (
      <div className="flex justify-center space-x-4 mt-8">
        <button
          onClick={() => handleOptionSelect('new')}
          className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 shadow-lg text-lg font-semibold"
        >
          Create New Itinerary
        </button>
        <button
          onClick={() => handleOptionSelect('edit')}
          className="px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 shadow-lg text-lg font-semibold"
        >
          Edit Existing Itinerary
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {option === 'new' ? 'Create New Itinerary' : 'Edit Existing Itinerary'}
        </h2>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 transition duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {option === 'new' && (
          <>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Destination:</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Number of Days:</label>
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Budget:</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </>
        )}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Themes:</label>
          <div className="flex flex-wrap gap-4">
            {themes.map(theme => (
              <label key={theme} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.themes.includes(theme)}
                  onChange={() => handleThemeChange(theme)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">{theme}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            {option === 'new' ? 'Additional Instructions:' : 'Edit Instructions:'}
          </label>
          <textarea
            name="prompt"
            value={formData.prompt}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
          />
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 shadow-md font-semibold"
        >
          {option === 'new' ? 'Create Itinerary' : 'Update Itinerary'}
        </button>
      </form>
    </div>
  );
};

export default ItineraryOptions;