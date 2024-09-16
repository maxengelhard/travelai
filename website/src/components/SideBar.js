import React from 'react';

const categories = ['Food', 'Culture', 'Nature', 'Adventure', 'Relaxation'];

const Sidebar = ({ selectedCategories, setSelectedCategories, dates, setDates }) => {
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <aside className="w-64 bg-gray-100 p-6 overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Categories</h2>
      {categories.map(category => (
        <label key={category} className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={selectedCategories.includes(category)}
            onChange={() => handleCategoryChange(category)}
            className="mr-2"
          />
          {category}
        </label>
      ))}
      <h2 className="text-lg font-semibold mt-6 mb-4">Dates</h2>
      <div className="space-y-2">
        <div>
          <label className="block text-sm">Start Date</label>
          <input
            type="date"
            value={dates.start}
            onChange={(e) => setDates(prev => ({ ...prev, start: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm">End Date</label>
          <input
            type="date"
            value={dates.end}
            onChange={(e) => setDates(prev => ({ ...prev, end: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;