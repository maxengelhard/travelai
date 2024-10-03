import React, { useState, useEffect } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import axios from 'axios';


const PricingOption = ({ title, yearlyPrice, monthlyPrice, credits, description, features, isPopular, yearlyStripeLink, monthlyStripeLink, isYearly , preFilledEmail, preFilledPromoCode}) => {
  const stripeLinkNaked = isYearly ? yearlyStripeLink : monthlyStripeLink;
  const monthsFreeSavings = 6; // Assuming 6 months free savings

  // Add the pre_filled_email parameter to the Stripe link if it exists
  const stripeLink = stripeLinkNaked && (preFilledEmail || preFilledPromoCode)
    ? `${stripeLinkNaked}${stripeLinkNaked.includes('?') ? '&' : '?'}${preFilledEmail ? `prefilled_email=${preFilledEmail}` : ''}${preFilledEmail && preFilledPromoCode ? '&' : ''}${preFilledPromoCode ? `prefilled_promo_code=${preFilledPromoCode}` : ''}`
    : stripeLinkNaked;

    const handleCheckoutInit = async (email) => {
      try {
        const apiUrl = `https://${process.env.REACT_APP_API_DOMAIN_SUFFIX}.tripjourney.co/checkout-init`;
        await axios.post(apiUrl, { email });
        console.log('Checkout initialized for:', email);
      } catch (error) {
        console.error('Error initializing checkout:', error);
      }
    };
  
    const handleClick = async (e) => {
      if (!stripeLink) {
        e.preventDefault();
        alert('Stripe link is not available at the moment. Please try again later.');
      } else if (preFilledEmail) {
        e.preventDefault();
        await handleCheckoutInit(preFilledEmail);
        window.open(stripeLink, '_blank');
      }
    };

  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg p-8 ${isPopular ? 'border-2 border-blue-400 relative' : ''}`}>
      {isPopular && (
        <span className="bg-blue-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide absolute -top-3 right-3">
          Most Popular
        </span>
      )}
      <h3 className="text-2xl font-semibold mb-4 text-white">{title}</h3>
      <div className="mb-6">
        <div className="flex items-end mb-2">
          <span className="text-5xl font-bold text-blue-400">$</span>
          <span className="text-5xl font-bold text-blue-400">
            {isYearly ? Math.round(yearlyPrice / 12) : monthlyPrice}
          </span>
          <span className="text-xl text-blue-400 ml-1 mb-1">per month</span>
        </div>
        <div className="flex flex-col">
          {isYearly && (
            <>
              <p className="text-lg font-semibold text-green-400">
                {monthsFreeSavings}+ months free
              </p>
              <p className="text-xl font-normal text-gray-300">
                billed yearly ${yearlyPrice}
              </p>
            </>
          )}
        </div>
      </div>
      <a 
        href={stripeLink || '#'}
        className={`block w-full text-white text-center py-4 px-6 rounded-lg transition duration-300 text-lg font-semibold ${stripeLink ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-500 cursor-not-allowed'} flex items-center justify-center`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        {stripeLink ? (
          <>
            Subscribe <FaArrowRight className="ml-2" />
          </>
        ) : (
          'Coming Soon'
        )}
      </a>
      <p className="mt-6 mb-4 text-lg text-gray-300">{credits}</p>
      <p className="mb-6 text-gray-400">{description}</p>
      <ul className="mb-8 text-gray-300 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [stripeLinks, setStripeLinks] = useState({
    proYearly: '',
    proMonthly: '',
    jetSetterYearly: '',
    jetSetterMonthly: ''
  });

  const [preFilledEmail, setPreFilledEmail] = useState('');
  const [preFilledPromoCode, setPreFilledPromoCode] = useState('');
  const location = useLocation();

  useEffect(() => {
    setStripeLinks({
      proYearly: process.env.REACT_APP_STRIPE_PRO_YEARLY_URL || '',
      proMonthly: process.env.REACT_APP_STRIPE_PRO_URL || '',
      jetSetterYearly: process.env.REACT_APP_STRIPE_JET_SETTER_YEARLY_URL || '',
      jetSetterMonthly: process.env.REACT_APP_STRIPE_JET_SETTER_URL || ''
    });

    // Get the pre_filled_email from URL parameters
    const params = new URLSearchParams(location.search);
    const email = params.get('prefilled_email');
    const promoCode = params.get('prefilled_promo_code');
    if (email) {
      setPreFilledEmail(email);
    }
    if (promoCode) {
      setPreFilledPromoCode(promoCode);
    }
  }, [location]);

  const togglePricing = () => {
    setIsYearly(!isYearly);
  };

  return (
    <div className="bg-black min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-white text-center mb-12">Choose Your Travel Plan</h2>
        <p className="text-xl text-gray-300 text-center mb-16 max-w-3xl mx-auto">
          Unlock the power of AI-driven travel planning with our flexible pricing options. 
          Whether you're an occasional traveler or a globetrotter, we have a plan for you.
        </p>
        <div className="flex justify-center mb-8">
          <button
            onClick={togglePricing}
            className={`px-4 py-2 rounded-l-lg ${isYearly ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
          >
            Yearly
          </button>
          <button
            onClick={togglePricing}
            className={`px-4 py-2 rounded-r-lg ${!isYearly ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
          >
            Monthly
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <PricingOption
            title="Pro"
            yearlyPrice={49}
            monthlyPrice={8.33}
            credits={isYearly ? "12,000 credits / year" : "1,000 credits / month"}
            description={`Ideal for any traveler. Enjoy more credits each ${isYearly ? "year" : "month"} for comprehensive trip planning.`}
            isPopular={true}
            yearlyStripeLink={stripeLinks.proYearly}
            monthlyStripeLink={stripeLinks.proMonthly}
            features={[
              "Custom travel themes",
              "Edit your itinerary",
              "Create new itineraries",
              "Cost breakdowns",
              "Downloadable itineraries",
            ]}
            isYearly={isYearly}
            preFilledEmail={preFilledEmail}
            preFilledPromoCode={preFilledPromoCode}
          />
          <PricingOption
            title="Jet Setter"
            yearlyPrice={499}
            monthlyPrice={83.33}
            credits={isYearly ? "240,000 credits / year" : "20,000 credits / month"}
            description="For the ultimate travel enthusiasts. Unlimited planning possibilities."
            isPopular={false}
            yearlyStripeLink={stripeLinks.jetSetterYearly}
            monthlyStripeLink={stripeLinks.jetSetterMonthly}
            features={[
              "All Pro features",
              "Priority customer support",
              "VIP experiences access",
              "Multi-city trip planning",
            ]}
            isYearly={isYearly}
            preFilledEmail={preFilledEmail}
            preFilledPromoCode={preFilledPromoCode}
          />
        </div>
      </div>
    </div>
  );
};

export default Pricing;