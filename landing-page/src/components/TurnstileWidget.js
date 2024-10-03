import React, { useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const TurnstileWidget = ({ onVerificationComplete }) => {
  const widgetRef = useRef(null);
  const widgetId = useRef(null);

  const handleVerify = useCallback(async (token) => {
    console.log('Turnstile token received:', token);
    try {
      const apiUrl = `https://${process.env.REACT_APP_API_DOMAIN_SUFFIX}.tripjourney.co/cloudflare-verify`;
      console.log('Sending verification request to:', apiUrl);
      
      const response = await axios.post(apiUrl, { token });
      console.log('Verification response:', response.data);
      
      if (response.data.success) {
        console.log('Turnstile verification successful');
        onVerificationComplete(true);
      } else {
        console.error('Turnstile verification failed:', response.data);
        onVerificationComplete(false);
      }
    } catch (error) {
      console.error('Error verifying Turnstile:', error.response ? error.response.data : error.message);
      onVerificationComplete(false);
    }
  }, [onVerificationComplete]);

  const renderTurnstile = useCallback(() => {
    if (window.turnstile && widgetRef.current && !widgetId.current) {
      widgetId.current = window.turnstile.render(widgetRef.current, {
        sitekey: process.env.REACT_APP_TURNSTILE_SITE_KEY,
        callback: handleVerify
      });
    }
  }, [handleVerify]);

  useEffect(() => {
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = renderTurnstile;
    } else {
      renderTurnstile();
    }

    return () => {
      if (widgetId.current) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [renderTurnstile]);

  return <div ref={widgetRef}></div>;
};

export default TurnstileWidget;