import React, { useState, useEffect, useMemo } from 'react';
import API from '../services/API';
import LoadingOverlay from './LoadingOverlay';

const availableThemes = [
  'Adventure', 'Social', 'Relaxation', 'Cultural', 'Foodie', 'Nightlife','Nature', 'Urban', 'Beach', 'Historical', 'Shopping'
];

const ItineraryForm = ({ userInfo, onItineraryUpdate, option, onClose, currentItinerary,darkMode }) => {
  const [formData, setFormData] = useState({
    destination: '',
    days: '',
    budget: '',
    themes: [],
    prompt: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (option === 'edit' && currentItinerary) {
      setFormData({
        destination: currentItinerary.destination || '',
        days: currentItinerary.days || '',
        budget: currentItinerary.budget || '',
        themes: currentItinerary.themes || [],
        prompt: ''
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

  const creditCost = useMemo(() => {
    const baseCost = 10;
    const themeCost = formData.themes.length === 0 ? 0 : formData.themes.length === 1 ? 4 : 6;
    return baseCost + themeCost;
  }, [formData.themes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = option === 'create' ? 'create-new-itinerary' : 'update-itinerary';
      const payload = {
        ...formData,
        itinerary_id: option === 'edit' ? currentItinerary.itinerary_id : undefined
      };
      const response = await API.post(endpoint, { data: payload });
    //   console.log(response)
      if (option === 'create' && response.data.body && response.data.body.itinerary_id) {
        localStorage.setItem('selectedItineraryId', response.data.body.itinerary_id.toString());
      }
      
      // Fetch updated user status
      const userStatusResponse = await API.get('user-status');
      console.log('User Status Response:', userStatusResponse);
      // Fetch updated user itineraries
      const userItinerariesResponse = await API.get('user-itineraries');
      
      onItineraryUpdate({
        userStatus: {
          ...userStatusResponse.data.body
        },
        userItineraries: userItinerariesResponse.data.body,
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting itinerary:', error);
      if (error.response && error.response.data && error.response.data.error === 'Insufficient credits') {
        alert('You do not have enough credits to perform this action.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingOverlay darkMode={darkMode} />}
      <form onSubmit={handleSubmit} className={`space-y-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        <h2 className={`text-2xl font-bold mb-4 text-center ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              option === 'edit' ? 'bg-gray-100 dark:bg-gray-700' : ''
            } ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'}`}
            required
            readOnly={option === 'edit'}
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'
            }`}
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'
            }`}
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
                    : darkMode
                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
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
            <label htmlFor="prompt" className="block mb-1 font-medium">Prompt for Editing</label>
            <textarea
              id="prompt"
              name="prompt"
              value={formData.prompt}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'
              }`}
              rows="3"
              placeholder="Enter any specific changes or additions you'd like for this itinerary..."
            ></textarea>
          </div>
        )}
        <div className="flex justify-end space-x-2 mt-6">
          <button 
            type="button" 
            onClick={onClose}
            className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              darkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              userInfo.credits < creditCost ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={userInfo.credits < creditCost}
          >
            {option === 'create' ? 'Create Itinerary' : 'Update Itinerary'} ({creditCost} credits)
          </button>
        </div>
        {userInfo.credits < creditCost && (
          <p className="text-red-500 text-sm mt-2">
            You don't have enough credits for this action. You need {creditCost} credits, but you only have {userInfo.credits}.
          </p>
        )}
      </form>
    </>
  );
};

export default ItineraryForm;