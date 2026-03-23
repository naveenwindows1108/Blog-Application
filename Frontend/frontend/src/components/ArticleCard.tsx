import React from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { optimizeCloudinaryUrl } from '../utils/optimizeImage';

// Helper function to convert HTML to plain text
const getTextFromHtml = (html: string) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

interface ArticleCardProps {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  imageUrl: string | null;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ id, title, content, category, date, readTime, imageUrl }) => {
  const queryClient = useQueryClient();

  const prefetchArticle = () => {
    queryClient.prefetchQuery({
      queryKey: ['post', String(id)],
      queryFn: async () => {
        const response = await api.get(`posts/${id}/`);
        return response.data;
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  const finalImageUrl = imageUrl ? optimizeCloudinaryUrl(imageUrl) : null;

  return (
    <div className={`article-card ${!finalImageUrl ? 'no-image' : ''}`} onMouseEnter={prefetchArticle}>
      {finalImageUrl && (
        <Link to={`/post/${id}`}>
          <img src={finalImageUrl} alt={title} className="article-image" />
        </Link>
      )}
      <div className="p-4 d-flex flex-column flex-grow-1">
        <span className="category-label">{category}</span>
        <Link to={`/post/${id}`} className="article-title">
          {title}
        </Link>
        <p className="text-muted text-truncate-custom" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {getTextFromHtml(content)}
        </p>
        <div className="article-meta mt-4 d-flex justify-content-between align-items-center pt-3 border-top border-light">
          <span>{date}</span>
          <span>{readTime}</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;