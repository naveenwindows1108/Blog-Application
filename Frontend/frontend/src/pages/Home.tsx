import React from 'react';
import Hero from '../components/Hero';
import ArticleGrid from '../components/ArticleGrid';

const Home: React.FC = () => {
  return (
    <div className="container">
      
      <Hero />
      
      <div className="mt-5 pt-4 border-top border-light mb-5">
        <h4 className="fw-bold mb-4" style={{ color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>
          All Articles
        </h4>
        
        <ArticleGrid />
        
      </div>
      
    </div>
  );
};

export default Home;