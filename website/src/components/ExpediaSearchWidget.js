import React, { useEffect, useRef } from 'react';

const ExpediaWidget = () => {
  const widgetRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://affiliates.expediagroup.com/products/widgets/assets/eg-widgets.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.EGWidgets && widgetRef.current) {
        window.EGWidgets.render(widgetRef.current);
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div ref={widgetRef} className="w-full min-h-[300px]">
      <div 
        className="eg-widget w-full h-full"
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