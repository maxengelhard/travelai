import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function Blog() {
  const [allPostsData, setAllPostsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`https://${process.env.REACT_APP_API_DOMAIN_SUFFIX}.tripjourney.co/blog`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }

        const data = await response.json();
        setAllPostsData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) return <div className="bg-black text-white min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="bg-black text-white min-h-screen flex items-center justify-center">Error: {error}</div>;

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto pt-32 px-4 py-8">
        <Helmet>
          <title>AI Travel Blog | Trip Journey AI</title>
          <meta name="description" content="Explore our AI travel blog for insights on AI in travel, travel tips, destination guides, and the latest in AI-powered travel planning." />
          <meta name="keywords" content="AI travel, travel planning, travel tips, destination guides, artificial intelligence" />
        </Helmet>
        <h1 className="text-4xl font-bold mb-8 text-blue-400">Trip Journey AI Blog</h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {allPostsData.map((post) => (
            <div key={post.id} className="border border-gray-700 p-4 rounded-lg bg-gray-900 flex flex-col">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded-lg mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-blue-300">{post.title}</h2>
              <p className="mb-4 text-gray-300 flex-grow">{post.excerpt}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">{post.date}</span>
                <Link to={`/blog/${post.id}`} className="text-blue-400 hover:underline">Read more</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Blog;