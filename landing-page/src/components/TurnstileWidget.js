import React from 'react';
import Turnstile from 'react-turnstile';
import axios from 'axios';

const TurnstileWidget = ({ onVerify }) => {
  const handleVerify = async (token) => {
    try {
      const response = await axios.post(`https://${process.env.REACT_APP_API_DOMAIN_SUFFIX}.tripjourney.co/verify-turnstile`, { token });
      if (response.data.success) {
        onVerify();
      } else {
        console.error('Turnstile verification failed');
      }
    } catch (error) {
      console.error('Error verifying Turnstile:', error);
    }
  };

  return (
    <Turnstile
      sitekey={process.env.REACT_APP_TURNSTILE_SITE_KEY}
      onVerify={handleVerify}
    />
  );
};

export default TurnstileWidget;