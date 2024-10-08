import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const blogPosts = {
  1: {
    title: "How AI is Revolutionizing Travel Planning",
    content: "Artificial Intelligence is transforming the way we plan and experience travel. From personalized recommendations to real-time itinerary adjustments, AI is making travel more accessible and enjoyable than ever before...",
  },
  2: {
    title: "Top 10 AI-Recommended Destinations for 2024",
    content: "Based on millions of data points and user preferences, our AI has compiled a list of the top 10 must-visit destinations for 2023. From hidden gems to popular hotspots, these locations offer something for every type of traveler...",
  },
  3: {
    title: "The Future of Personalized Travel Itineraries",
    content: "Gone are the days of one-size-fits-all travel plans. With AI-powered itineraries, every aspect of your trip can be tailored to your unique preferences, ensuring a truly personalized and unforgettable travel experience...",
  },
};

function BlogPost() {
  const { id } = useParams();
  const post = blogPosts[id];

  if (!post) {
    return <div className="bg-black text-white min-h-screen flex items-center justify-center">Post not found</div>;
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto pt-32 px-4 py-8">
        <Helmet>
          <title>{post.title} | Trip Journey AI Blog</title>
          <meta name="description" content={`Read about ${post.title} on the Trip Journey AI blog.`} />
        </Helmet>
        <h1 className="text-3xl font-bold mb-4 text-blue-400">{post.title}</h1>
        <p className="text-gray-300">{post.content}</p>
      </div>
    </div>
  );
}

export default BlogPost;