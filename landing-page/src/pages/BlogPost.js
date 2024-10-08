import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function BlogPost() {
  const { title } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`https://${process.env.REACT_APP_API_DOMAIN_SUFFIX}.tripjourney.co/blog?title=${encodeURIComponent(title)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          if (response.status === 404) {
            navigate('/blog');
            return;
          }
          throw new Error('Failed to fetch blog post');
        }
  
        const data = await response.json();
        setPost(data.body);
      } catch (err) {
        console.error('Error fetching post:', err); // Add this line
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPost();
  }, [title, navigate]);

  if (isLoading) return <div className="bg-black text-white min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="bg-black text-white min-h-screen flex items-center justify-center">Error: {error}</div>;
  if (!post) return <div className="bg-black text-white min-h-screen flex items-center justify-center">Post not found</div>;

  return (
    <div className="bg-black text-white min-h-screen">
      <Helmet>
        <title>{post.title ? `${post.title} | Trip Journey AI Blog` : 'Blog Post | Trip Journey AI'}</title>
        <meta name="description" content={post.excerpt || ''} />
        <meta name="keywords" content={post.tags ? post.tags.join(', ') : ''} />
      </Helmet>
      <div className="container mx-auto pt-32 px-4 py-8">
        <Link to="/blog" className="text-blue-400 hover:underline mb-4 inline-block">&larr; Back to Blog</Link>
        <h1 className="text-4xl font-bold mb-4 text-blue-400">{post.title || 'No Title'}</h1>
        <div className="flex items-center mb-4">
          <span className="text-gray-400 mr-4">{post.author || 'No Author'}</span>
          <span className="text-gray-400">{post.date || 'No Date'}</span>
        </div>
        {post.image ? (
          <img src={post.image} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-8" />
        ) : (
          <div className="w-full h-64 bg-gray-700 rounded-lg mb-8 flex items-center justify-center">No Image</div>
        )}
        <div className="text-gray-300 prose prose-invert max-w-none">
          {post.content ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <p>No content available</p>
          )}
        </div>
        {post.tags && post.tags.length > 0 ? (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2 text-blue-300">Tags:</h3>
            <div className="flex flex-wrap">
              {post.tags.map((tag, index) => (
                <span key={index} className="bg-gray-800 text-gray-300 px-2 py-1 rounded mr-2 mb-2">{tag}</span>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-8 text-gray-400">No tags available</p>
        )}
      </div>
    </div>
  );
}

export default BlogPost;