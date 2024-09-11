import React from 'react';

const TestimonialCard = ({ name, location, quote, image }) => (
  <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
    <p className="text-gray-300 italic mb-4">"{quote}"</p>
    <div className="flex items-center">
      <img src={image} alt={name} className="w-12 h-12 rounded-full mr-4" />
      <div>
        <p className="text-white font-semibold">{name}</p>
        <p className="text-gray-400 text-sm">{location}</p>
      </div>
    </div>
  </div>
);

const Testimonial = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "New York, USA",
      quote: "TripJourney made planning my European adventure a breeze! The AI-generated itinerary was spot-on and saved me hours of research.",
      image: "https://randomuser.me/api/portraits/women/65.jpg"
    },
    {
      name: "Mark Thompson",
      location: "London, UK",
      quote: "As a frequent traveler, the Pro plan has been a game-changer. It's like having a personal travel agent at my fingertips!",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Emily Chen",
      location: "Singapore",
      quote: "The Jet Setter plan is perfect for my business trips. It helps me balance work and exploration effortlessly.",
      image: "https://randomuser.me/api/portraits/women/26.jpg"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto pt-16">
      <h2 className="text-3xl font-extrabold text-white text-center mb-12">What Our Travelers Say</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} />
        ))}
      </div>
    </div>
  );
};

export default Testimonial;