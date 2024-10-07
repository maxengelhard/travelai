import React, { useEffect, useRef } from 'react';

const ExpediaWidget = ({ layout = 'medium-rectangle' }) => {
  const widgetRef = useRef(null);

  useEffect(() => {
    if (widgetRef.current) {
      const script = document.createElement('script');
      script.textContent = `
        (function initialize(window, document) {
  'use strict';

  window.eg = window.eg || {};
  window.eg.affiliate = window.eg.affiliate || {};
  window.eg.affiliate.banners = window.eg.affiliate.banners || {};
  window.eg.affiliate.banners.elements = window.eg.affiliate.banners.elements || {};

  function toArray(value /* any */) {
    return Array.prototype.slice.call(value);
  }

  function isEmpty(value /* any */) {
    return [undefined, null, 'undefined', 'null', ''].indexOf(value) > -1;
  }

  function getClassName(/* Arguments<string> */) {
    return toArray(arguments).join(' ');
  }

  function getCleanInput(value /* any */) {
    return typeof value === 'string' ? value.replace(/^\\s*(\\S*)\\s*$/, '$1') : value;
  }

  function getUrlSearch(urlSearchParams /* [[string, any]] */) {
    const urlSearch = urlSearchParams
      .map(function urlSearchParamMapper(urlSearchParam /* [string, any] */) {
        const key = urlSearchParam[0];
        const value = urlSearchParam[1];

        return !isEmpty(value) ? key + '=' + encodeURIComponent(value) : undefined;
      })
      .filter(Boolean)
      .join('&');

    return urlSearch ? '?' + urlSearch : '';
  }

  function getGeneratedInstanceId() {
    const base = 36;

    const timestamp = Date.now().toString(base);
    const key = Math.random().toString(base).substring(2);

    return timestamp + key;
  }

  if (!window.eg.affiliate.banners.initialized) {
    const bannersUrl = 'https://affiliates.expediagroup.com/products/banners';

    window.addEventListener('DOMContentLoaded', function handleDOMContentLoaded() {
      if (!window.eg.affiliate.banners.loaded) {
        (function elements() {
          const elements = toArray(document.querySelectorAll('.eg-affiliate-banners'));

          elements.forEach(function elementMapper(element) {
            const program = getCleanInput(element.getAttribute('data-program'));

            const layout = getCleanInput(element.getAttribute('data-layout'));
            const image = getCleanInput(element.getAttribute('data-image'));
            const message = getCleanInput(element.getAttribute('data-message'));
            const link = getCleanInput(element.getAttribute('data-link'));

            const networkId = getCleanInput(element.getAttribute('data-network'));

            // direct
            const mdpcid = getCleanInput(element.getAttribute('data-mdpcid'));

            // pz
            const camRef = getCleanInput(element.getAttribute('data-camref'));
            const pubRef = getCleanInput(element.getAttribute('data-pubref'));
            const adRef = getCleanInput(element.getAttribute('data-adref'));

            const instance = getGeneratedInstanceId();

            element.setAttribute('data-instance', instance);

            const bannersUrlSearch = getUrlSearch([
              ['program', program],

              ['layout', layout],
              ['image', image],
              ['message', message],
              ['link', link],

              ['network', networkId],

              // direct
              ['mdpcid', mdpcid],

              // pz
              ['camref', camRef],
              ['pubref', pubRef],
              ['adref', adRef],

              ['instance', instance],
            ]);

            const frame = document.createElement('iframe');

            frame.className = getClassName('eg-affiliate-banners-frame');
            frame.src = bannersUrl + bannersUrlSearch;
            frame.style.width = '0';
            frame.style.height = '0';
            frame.style.margin = 'auto';
            frame.style.border = 'none';

            element.appendChild(frame);

            window.eg.affiliate.banners.elements[instance] = element;
          });
        })();

        (function events() {
          function checkMessageEventOrigin(event, origins) {
            return event && origins.indexOf(event.origin) !== -1;
          }

          function checkMessageEventDataType(event, types) {
            return event && event.data && types.indexOf(event.data.type) !== -1;
          }
          window.addEventListener('message', function handleMessage(event /* MessageEvent */) {
            if (
              checkMessageEventOrigin(event, [
                'https://affiliates.expediagroup.com',
                'https://test.affiliates.expediagroup.com',
                'http://localhost:8080',
              ]) &&
              checkMessageEventDataType(event, ['eg-affiliate-banners/resize'])
            ) {
              const meta = event.data.meta;
              const payload = event.data.payload;

              const element = window.eg.affiliate.banners.elements[meta.instance];
              const frame = element.querySelector('.eg-affiliate-banners-frame');

              frame.style.width = payload.frame.style.width;
              frame.style.height = payload.frame.style.height;
            }
          });
        })();

        window.eg.affiliate.banners.loaded = true;
      }
    });

    window.eg.affiliate.banners.initialized = true;
  }
})(window, document);`;
      
      // Append the script to the widget container
      widgetRef.current.appendChild(script);
      
      // Manually trigger DOMContentLoaded event
      const event = new Event('DOMContentLoaded');
      window.dispatchEvent(event);
    }
  }, []);

  return (
    <div ref={widgetRef} className="sidebar-widget" style={{width: '300px', height: '250px', border: '1px solid red'}}>
      <div 
        className="eg-affiliate-banners" 
        data-program="us-expedia" 
        data-network="pz" 
        data-layout="medium-rectangle" 
        data-image="sailing" 
        data-message="bye-bye-bucket-list-hello-adventure" 
        data-link="home" 
        data-camref="1100l3ZDyb" 
        data-pubref=""
      ></div>
    </div>
  );
};

export default ExpediaWidget;