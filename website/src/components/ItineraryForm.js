import React, { useState, useEffect } from 'react';
import API from '../services/API';

const availableThemes = [
  'Adventure', 'Relaxation', 'Cultural', 'Foodie', 'Nature', 'Urban', 'Beach', 'Historical'
];

const ItineraryForm = ({ userInfo, onItineraryUpdate, option, onClose, currentItinerary }) => {
  const [formData, setFormData] = useState({
    destination: '',
    days: '',
    budget: '',
    themes: [],
    prompts: ''
  });

  useEffect(() => {
    if (option === 'edit' && currentItinerary) {
      setFormData({
        destination: currentItinerary.destination || '',
        days: currentItinerary.days || '',
        budget: currentItinerary.budget || '',
        themes: currentItinerary.themes || [],
        prompts: ''
      });
    }
  }, [option, currentItinerary]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeToggle = (theme) => {
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
      const endpoint = option === 'create' ? 'create-new-itinerary' : 'update-itinerary';
      const response = await API.post(endpoint, { data: formData });
      onItineraryUpdate(response.data.body);
      onClose();
    } catch (error) {
      console.error('Error submitting itinerary:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {option === 'create' ? 'Create New Itinerary' : 'Edit Existing Itinerary'}
      </h2>
      <div>
        <label htmlFor="destination" className="block mb-1 font-medium">Destination</label>
        <input
          type="text"
          id="destination"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="days" className="block mb-1 font-medium">Number of Days</label>
        <input
          type="number"
          id="days"
          name="days"
          value={formData.days}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="budget" className="block mb-1 font-medium">Budget</label>
        <input
          type="number"
          id="budget"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Themes</label>
        <div className="flex flex-wrap -mx-1">
          {availableThemes.map(theme => (
            <button
              key={theme}
              type="button"
              onClick={() => handleThemeToggle(theme)}
              className={`m-1 px-3 py-1 rounded-full text-sm ${
                formData.themes.includes(theme)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>
      {option === 'edit' && (
        <div>
          <label htmlFor="prompts" className="block mb-1 font-medium">Prompts for Editing</label>
          <textarea
            id="prompts"
            name="prompts"
            value={formData.prompts}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter any specific changes or additions you'd like for this itinerary..."
          ></textarea>
        </div>
      )}
      <div className="flex justify-end space-x-2 mt-6">
        <button 
          type="button" 
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {option === 'create' ? 'Create Itinerary' : 'Update Itinerary'}
        </button>
      </div>
    </form>
  );
};

export default ItineraryForm;