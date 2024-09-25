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
      quote: "This AI travel planner is a game-changer. It's like having a personal travel agent at my fingertips, available 24/7!",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Emily Chen",
      location: "Singapore",
      quote: "TripJourney helps me balance work and exploration effortlessly. It creates perfect itineraries for my business trips with leisure time included.",
      image: "https://randomuser.me/api/portraits/women/26.jpg"
    },
    {
      name: "Carlos Rodriguez",
      location: "Barcelona, Spain",
      quote: "As a foodie, I was amazed by the local culinary experiences TripJourney recommended. It truly understands my taste!",
      image: "https://randomuser.me/api/portraits/men/45.jpg"
    },
    {
      name: "Brandie Thomas",
      location: "Chicago, USA",
      quote: "The cultural insights provided by TripJourney made my solo trip to Japan unforgettable. I felt like a local everywhere I went!",
      image: "https://randomuser.me/api/portraits/women/74.jpg"
    },
    {
      name: "John King",
      location: "Sydney, Australia",
      quote: "TripJourney's real-time adjustments saved our family vacation when unexpected weather hit. It quickly suggested great indoor alternatives!",
      image: "https://randomuser.me/api/portraits/men/22.jpg"
    },
    {
      name: "Maria Gonzalez",
      location: "Mexico City, Mexico",
      quote: "I love how TripJourney balances popular attractions with hidden gems. It made my Paris trip unique and Instagram-worthy!",
      image: "https://randomuser.me/api/portraits/women/90.jpg"
    },
    {
      name: "Kevin Johnson",
      location: "Austin, USA",
      quote: "As a budget traveler, I appreciate how TripJourney optimizes costs without compromising on experiences. It's perfect for backpackers!",
      image: "https://randomuser.me/api/portraits/men/55.jpg"
    },
    {
      name: "Sophie Dubois",
      location: "Montreal, Canada",
      quote: "TripJourney's suggestions for eco-friendly travel options aligned perfectly with my values. It made sustainable travel planning so easy!",
      image: "https://randomuser.me/api/portraits/women/39.jpg"
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