import React, { useEffect, useRef } from 'react';

const ExpediaWidget = () => {
  const widgetRef = useRef(null);

  useEffect(() => {
    const loadExpediaWidget = () => {
      if (!document.querySelector('.eg-widgets-script')) {
        const script = document.createElement('script');
        script.src = 'https://affiliates.expediagroup.com/products/widgets/assets/eg-widgets.js';
        script.className = 'eg-widgets-script';
        script.async = true;
        script.onload = () => {
          // The script will initialize itself, we don't need to call initialize
          console.log('Expedia widget script loaded');
        };
        document.body.appendChild(script);
      } else {
        // If the script is already loaded, we need to manually trigger the initialization
        if (window.eg && window.eg.widgets && !window.eg.widgets.loaded) {
          const event = new Event('DOMContentLoaded');
          window.dispatchEvent(event);
        }
      }
    };

    loadExpediaWidget();

    // Cleanup function
    return () => {
      const script = document.querySelector('.eg-widgets-script');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div ref={widgetRef} className="sidebar-widget">
      <div 
        className="eg-widget" 
        data-widget="search" 
        data-program="us-expedia" 
        data-lobs="stays,flights" 
        data-network="pz" 
        data-camref="1100l3ZDyb"
      ></div>
    </div>
  );
};

export default ExpediaWidget;