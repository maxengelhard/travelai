import React from 'react';
import { Helmet } from 'react-helmet';

function PrivacyPolicy() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Helmet>
        <title>Privacy Policy | Trip Journey AI</title>
        <meta name="description" content="Trip Journey AI's Privacy Policy. Learn how we collect, use, and protect your personal information." />
      </Helmet>
      <div className="container mx-auto pt-32 px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-blue-400 text-center">Privacy Policy</h1>
        
        <div className="mb-8">
          <p className="mb-4 text-gray-300">Last updated: October 11, 2024</p>
          <p className="mb-4 text-gray-300">At Trip Journey AI, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our website and services.</p>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-blue-400">Information We Collect</h2>
        <div className="mb-8">
          <p className="mb-4 text-gray-300">We collect information that you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include:</p>
          <ul className="list-disc list-inside mb-4 text-gray-300">
            <li>Name and contact information</li>
            <li>Login credentials</li>
            <li>Payment information</li>
            <li>Travel preferences and history</li>
            <li>Communications with us</li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-blue-400">How We Use Your Information</h2>
        <div className="mb-8">
          <p className="mb-4 text-gray-300">We use your information to:</p>
          <ul className="list-disc list-inside mb-4 text-gray-300">
            <li>Provide and improve our services</li>
            <li>Personalize your experience</li>
            <li>Process transactions</li>
            <li>Communicate with you</li>
            <li>Analyze usage and trends</li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-blue-400">Data Security</h2>
        <div className="mb-8">
          <p className="mb-4 text-gray-300">We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-blue-400">Your Rights</h2>
        <div className="mb-8">
          <p className="mb-4 text-gray-300">You have the right to access, correct, or delete your personal information. You may also have the right to restrict or object to certain processing of your data. To exercise these rights, please contact us at tripjourneyai@gmail.com.</p>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-blue-400">Changes to This Policy</h2>
        <div className="mb-8">
          <p className="mb-4 text-gray-300">We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
        </div>

        <div className="text-center">
          <p className="text-xl text-gray-300 mb-8">If you have any questions about this Privacy Policy, please contact us at tripjourneyai@gmail.com.</p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;