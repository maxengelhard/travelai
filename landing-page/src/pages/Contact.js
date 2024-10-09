import React from 'react';
import { Helmet } from 'react-helmet';

function Contact() {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto pt-32 px-4 py-8">
        <Helmet>
          <title>Contact Us | Trip Journey AI</title>
          <meta name="description" content="Get in touch with Trip Journey AI for any questions or support regarding our AI-powered travel planning services." />
        </Helmet>
        <h1 className="text-3xl font-bold mb-4 text-blue-400">Contact Us</h1>
        <p className="mb-4 text-gray-300">We'd love to hear from you! Whether you have a question about our services, need help with your account, or just want to share your experience, we're here to help.</p>
        <p className="mb-4 text-gray-300">Email: <span className="text-blue-400">tripjourneyai@gmail.com</span></p>
      </div>
    </div>
  );
}

export default Contact;