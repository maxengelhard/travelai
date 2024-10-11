import React from 'react';
import { Helmet } from 'react-helmet';

function TermsOfService() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Helmet>
        <title>Terms of Service | Trip Journey AI</title>
        <meta name="description" content="Trip Journey AI's Terms of Service. Understand the rules and regulations governing the use of our services." />
      </Helmet>
      <div className="container mx-auto pt-32 px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-blue-400 text-center">Terms of Service</h1>
        
        <div className="mb-8">
          <p className="mb-4 text-gray-300">Last updated: October 11, 2024</p>
          <p className="mb-4 text-gray-300">Welcome to Trip Journey AI. By using our website and services, you agree to comply with and be bound by the following terms and conditions. Please read these Terms of Service carefully before using our platform.</p>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-blue-400">1. Acceptance of Terms</h2>
        <div className="mb-8">
          <p className="mb-4 text-gray-300">By accessing or using Trip Journey AI's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.</p>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-blue-400">2. Use of Services</h2>
        <div className="mb-8">
          <p className="mb-4 text-gray-300">You agree to use our services only for lawful purposes and in accordance with these Terms of Service. You are prohibited from:</p>
          <ul className="list-disc list-inside mb-4 text-gray-300">
            <li>Using the services in any way that violates any applicable laws or regulations</li>
            <li>Attempting to interfere with or disrupt the integrity or performance of the services</li>
            <li>Attempting to gain unauthorized access to any part of the services or its related systems or networks</li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-blue-400">3. User Accounts</h2>
        <div className="mb-8">
          <p className="mb-4 text-gray-300">To access certain features of our services, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-blue-400">4. Intellectual Property</h2>
        <div className="mb-8">
          <p className="mb-4 text-gray-300">The content, features, and functionality of our services are owned by Trip Journey AI and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-blue-400">5. Limitation of Liability</h2>
        <div className="mb-8">
          <p className="mb-4 text-gray-300">Trip Journey AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the services.</p>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-blue-400">6. Changes to Terms</h2>
        <div className="mb-8">
          <p className="mb-4 text-gray-300">We reserve the right to modify or replace these Terms of Service at any time. We will provide notice of any significant changes by posting the new Terms of Service on this page and updating the "Last updated" date.</p>
        </div>

        <div className="text-center">
          <p className="text-xl text-gray-300 mb-8">If you have any questions about these Terms of Service, please contact us at tripjourneyai@gmail.com.</p>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;