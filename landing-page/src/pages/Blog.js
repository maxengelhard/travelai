import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const blogPosts = [
  { id: 1, title: "How AI is Revolutionizing Travel Planning", excerpt: "Discover the ways artificial intelligence is changing the way we plan and experience travel." },
  { id: 2, title: "Top 10 AI-Recommended Destinations for 2024", excerpt: "Our AI has analyzed millions of travel reviews to bring you the top destinations for this year." },
  { id: 3, title: "The Future of Personalized Travel Itineraries", excerpt: "Learn how AI-powered itineraries are creating unique and unforgettable travel experiences." },
];

function Blog() {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto pt-32 px-4 py-8">
        <Helmet>
          <title>Blog | Trip Journey AI</title>
          <meta name="description" content="Explore our blog for insights on AI in travel, travel tips, and destination guides powered by Trip Journey AI." />
        </Helmet>
        <h1 className="text-3xl font-bold mb-8 text-blue-400">Trip Journey AI Blog</h1>
        <div className="grid gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="border border-gray-700 p-4 rounded-lg bg-gray-900">
              <h2 className="text-xl font-semibold mb-2 text-blue-300">{post.title}</h2>
              <p className="mb-4 text-gray-300">{post.excerpt}</p>
              <Link to={`/blog/${post.id}`} className="text-blue-400 hover:underline">Read more</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Blog;