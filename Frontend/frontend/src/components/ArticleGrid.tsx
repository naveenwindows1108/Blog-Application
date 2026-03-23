import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom'; 
import { useQuery } from '@tanstack/react-query'; 
import ArticleCard from './ArticleCard';
import api from '../api/axios';
import { optimizeCloudinaryUrl } from '../utils/optimizeImage';

interface DjangoPost {
  id: number;
  title: string;
  content: string;
  category: any;
  created_at: string;
  image: string | null;
}

const ArticleGrid: React.FC = () => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  const showCreateCard = !searchQuery && !selectedCategory;
  const initialPostCount = showCreateCard ? 5 : 6;
  
  const [visibleCount, setVisibleCount] = useState(initialPostCount);

  useEffect(() => {
    setVisibleCount(showCreateCard ? 5 : 6);
  }, [searchQuery, selectedCategory, showCreateCard]);

  const { data: allPosts, isLoading, isError } = useQuery({
    queryKey: ['posts'], 
    queryFn: async () => {
      const response = await api.get('posts/');
      return response.data as DjangoPost[];
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" style={{ color: 'var(--accent-color)' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="alert alert-danger text-center shadow-sm">Failed to load articles. Make sure your Django server is running.</div>;
  }

  let displayedPosts = allPosts || [];
  
  if (selectedCategory) {
    displayedPosts = displayedPosts.filter((post: any) => {
      if (post.category && typeof post.category === 'object') {
        return post.category.slug === selectedCategory;
      }
      if (typeof post.category === 'string') {
        return post.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory;
      }
      return false;
    });
  }

  if (searchQuery) {
    const lowerCaseQuery = searchQuery.toLowerCase();
    displayedPosts = displayedPosts.filter((post) => 
      post.title.toLowerCase().includes(lowerCaseQuery) || 
      post.content.toLowerCase().includes(lowerCaseQuery)
    );
  }

  const visiblePosts = displayedPosts.slice(0, visibleCount);

  return (
    <div className="row g-4 mb-5">
      
      {searchQuery && (
        <div className="col-12 mb-2">
          <h4 className="fw-bold text-dark">
            Search results for "{searchQuery}" <span className="text-muted fs-6 fw-normal">({displayedPosts.length} found)</span>
          </h4>
        </div>
      )}

      {showCreateCard && (
        <div className="col-12 col-md-6 col-lg-4">
          <Link to="/create-post" className="text-decoration-none h-100 d-block">
            <div className="article-card d-flex flex-column align-items-center justify-content-center text-center p-4" 
                 style={{ border: '2px dashed var(--accent-color)', backgroundColor: 'transparent', minHeight: '100%' }}>
              <div className="mb-3" style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                <i className="bi bi-plus-lg"></i>
              </div>
              <h5 className="fw-bold mb-2 text-dark">Write an Article</h5>
              <p className="text-muted small mb-0">Share your thoughts and ideas with the community.</p>
            </div>
          </Link>
        </div>
      )}

      {visiblePosts.length === 0 ? (
        <div className="col-12 text-center py-5">
          <i className="bi bi-search text-muted" style={{ fontSize: '3rem' }}></i>
          <h4 className="mt-3 fw-bold text-dark">No articles found</h4>
          <p className="text-muted">We couldn't find anything matching your search. Try different keywords.</p>
          <Link to="/" className="btn btn-accent mt-2">Clear Search</Link>
        </div>
      ) : (
        visiblePosts.map((post) => {
          const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const displayImage = optimizeCloudinaryUrl(post.image);
          const categoryName = typeof post.category === 'object' && post.category !== null ? post.category.name : post.category || 'Uncategorized';
          const wordCount = post.content.split(' ').length;
          const readTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min';

          return (
            <div key={post.id} className="col-12 col-md-6 col-lg-4">
              <ArticleCard 
                id={post.id}
                title={post.title}
                content={post.content}
                category={categoryName}
                date={formattedDate}
                readTime={readTime}
                imageUrl={displayImage}
              />
            </div>
          );
        })
      )}

      {visibleCount < displayedPosts.length && (
        <div className="col-12 text-center mt-5">
          <button 
            onClick={() => setVisibleCount(prev => prev + 6)} 
            className="btn fw-bold px-4 py-2"
            style={{ 
              backgroundColor: 'transparent', 
              border: '2px solid var(--accent-color)', 
              color: 'var(--accent-color)',
              borderRadius: '30px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-color)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--accent-color)';
            }}
          >
            Load More Articles <i className="bi bi-arrow-down ms-1"></i>
          </button>
        </div>
      )}

    </div>
  );
};

export default ArticleGrid;