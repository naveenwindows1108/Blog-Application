import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { optimizeCloudinaryUrl } from '../utils/optimizeImage';

const getTextFromHtml = (html: string) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

interface Post {
  id: number;
  title: string;
  content: string;
  category: any;
  created_at: string;
  image: string | null;
}

const Hero: React.FC = () => {
  const { data: allPosts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await api.get('posts/');
      return response.data as Post[];
    }
  });
  const randomPosts = useMemo(() => {
    if (!allPosts || allPosts.length === 0) return [];
    return [...allPosts].sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [allPosts]);

  if (isLoading) {
    return (
      <div className="row g-4 my-4" style={{ minHeight: '480px' }}>
        <div className="col-12 d-flex justify-content-center align-items-center bg-light rounded-4">
          <div className="spinner-border text-primary" style={{ color: 'var(--accent-color)' }} role="status"></div>
        </div>
      </div>
    );
  }

  const getExcerpt = (text: string, length: number = 100) => {
    const plainText = getTextFromHtml(text);
    return plainText.length > length ? plainText.substring(0, length) + '...' : plainText;
  };

  const getCategoryName = (category: any) => {
    return typeof category === 'object' && category !== null ? category.name : category || 'Uncategorized';
  };

  const mainPost = randomPosts[0];
  const mainPostImage = mainPost ? optimizeCloudinaryUrl(mainPost.image) : null;
  const subPost1 = randomPosts[1];
  const subPost2 = randomPosts[2];

  if (!mainPost) {
    return (
      <div className="row g-4 my-4">
        <div className="col-12">
          <div className="hero-main-card d-flex flex-column align-items-center justify-content-center text-center p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '2px dashed var(--border-muted)' }}>
            <h2 className="fw-bold mb-3" style={{ color: 'var(--text-heading)' }}>Welcome to Scriptly!</h2>
            <p className="text-muted mb-4 max-w-500">Your blog is currently empty. Be the first to share your thoughts, tutorials, or stories with the world.</p>
            <Link to="/create-post" className="btn btn-accent px-4 py-2 fw-bold">
              <i className="bi bi-pencil-square me-2"></i>Write the First Article
            </Link>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="row g-4 my-4">
      <div className="col-12 col-lg-8">
        <div 
          className="featured-card position-relative rounded-4 overflow-hidden shadow-sm" 
          style={{ minHeight: '480px' }}
        >
          {mainPostImage ? (
            <img
              src={mainPostImage}
              alt={mainPost.title || "Article"}
              className="position-absolute w-100 h-100 object-fit-cover"
              style={{ top: 0, left: 0, zIndex: 1 }}
            />
          ) : (
            <div
              className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
              style={{
                top: 0, left: 0, zIndex: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              <i className="bi bi-journal-richtext text-white" style={{ fontSize: '6rem', opacity: 0.1 }}></i>
            </div>
          )}

          <div 
            className="position-absolute bottom-0 start-0 w-100 p-4 p-md-5 d-flex flex-column justify-content-end"
            style={{
              zIndex: 2,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
              minHeight: '60%'
            }}
          >
            <span 
              className="text-uppercase mb-2 d-inline-block fw-bold" 
              style={{ color: '#a3bffa', letterSpacing: '1px', fontSize: '0.8rem' }}
            >
              {getCategoryName(mainPost.category)}
            </span>

            <h2 className="text-white fw-bold mb-3">
              {mainPost.title || "No Title"}
            </h2>

            <p className="text-white-50 mb-4" style={{ maxWidth: '600px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {getExcerpt(mainPost.content, 120) || "No content"}
            </p>

            <div>
                <Link to={`/post/${mainPost.id}`} className="btn btn-light btn-sm fw-bold px-4 rounded-pill">
                    Read more
                </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-4 d-flex flex-column gap-4">
        
        {subPost1 ? (
          <div className="sub-hero-card d-flex flex-column justify-content-center">
            <span className="category-label">{getCategoryName(subPost1.category)}</span>
            <h5 className="fw-bold mb-3 lh-base" style={{ color: 'var(--text-heading)' }}>
              {subPost1.title}
            </h5>
            <Link to={`/post/${subPost1.id}`} className="read-more-link mt-auto">
              Read more <span className="ms-2">→</span>
            </Link>
          </div>
        ) : (
          <div className="sub-hero-card d-flex flex-column justify-content-center align-items-center text-center" style={{ border: '2px dashed var(--border-muted)', backgroundColor: 'transparent' }}>
            <h6 className="text-muted mb-3">Spot Available</h6>
            <Link to="/create-post" className="btn btn-sm btn-outline-primary">Write an Article</Link>
          </div>
        )}

        {subPost2 ? (
          <div className="sub-hero-card d-flex flex-column justify-content-center">
            <span className="category-label">{getCategoryName(subPost2.category)}</span>
            <h5 className="fw-bold mb-3 lh-base" style={{ color: 'var(--text-heading)' }}>
              {subPost2.title}
            </h5>
            <Link to={`/post/${subPost2.id}`} className="read-more-link mt-auto">
              Read more <span className="ms-2">→</span>
            </Link>
          </div>
        ) : (
          <div className="sub-hero-card d-flex flex-column justify-content-center align-items-center text-center" style={{ border: '2px dashed var(--border-muted)', backgroundColor: 'transparent' }}>
            <h6 className="text-muted mb-3">Spot Available</h6>
            <Link to="/create-post" className="btn btn-sm btn-outline-primary">Write an Article</Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default Hero;