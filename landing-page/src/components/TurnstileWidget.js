import React from 'react';
import Turnstile from 'react-turnstile';
import axios from 'axios';

const TurnstileWidget = ({ setIsTurnstileVerified }) => {
  const handleVerify = async (token) => {
    console.log('Turnstile token received:', token);
    try {
      const apiUrl = `https://${process.env.REACT_APP_API_DOMAIN_SUFFIX}.tripjourney.co/cloudflare-verify`;
      console.log('Sending verification request to:', apiUrl);
      
      const response = await axios.post(apiUrl, { token });
      console.log('Verification response:', response.data);
      
      if (response.data.success) {
        console.log('Turnstile verification successful');
        setIsTurnstileVerified(true);
      } else {
        console.error('Turnstile verification failed:', response.data);
        setIsTurnstileVerified(false);
      }
    } catch (error) {
      console.error('Error verifying Turnstile:', error.response ? error.response.data : error.message);
      setIsTurnstileVerified(false);
    }
  };

  return (
    <div>
      <Turnstile
        sitekey={process.env.REACT_APP_TURNSTILE_SITE_KEY}
        onVerify={handleVerify}
        onError={() => console.error('Turnstile error')}
        onExpire={() => console.log('Turnstile token expired')}
        refreshExpired="auto"
        theme="light"
        size="normal"
        fixedSize={true}
      />
    </div>
  );
};

export default TurnstileWidget;