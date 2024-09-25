import React from 'react';
import ChatInterface from './ChatInterface';

const MainContent = ({ userInfo }) => {
  return (
    <div className="h-full">
      <ChatInterface initialItinerary={userInfo.initial_itinerary} />
    </div>
  );
};

export default MainContent;