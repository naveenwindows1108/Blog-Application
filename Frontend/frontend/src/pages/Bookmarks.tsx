import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
interface Bookmark {
  id: number;
  post: any;
  created_at: string;
}

const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Reading List | Blog";

    const fetchBookmarks = async () => {
      try {
        const response = await api.get("bookmarks/");
        setBookmarks(response.data.results || response.data);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 pt-4 mb-5 placeholder-glow">
         <h2 className="placeholder col-3 mb-4 bg-dark rounded"></h2>
         <div className="row g-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="col-12 col-md-4">
                 <div className="placeholder w-100 rounded bg-secondary" style={{ height: "250px" }}></div>
              </div>
            ))}
         </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-4 mb-5">
      <h2 className="fw-bold mb-4">My Reading List</h2>
      
      {bookmarks.length === 0 ? (
        <div className="alert alert-light text-center py-5 border">
          <h5 className="fw-bold text-muted">Your reading list is empty</h5>
          <p className="text-muted mb-0">Save articles you want to read later by clicking the bookmark icon on any post.</p>
        </div>
      ) : (
        <div className="row g-4">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="col-12 col-md-4">
              <div className="card h-100 shadow-sm border-0 hover-scale" style={{ transition: "transform 0.2s" }}>
                <Link to={`/post/${bookmark.post.id || bookmark.post}`} className="text-decoration-none p-3 d-block text-dark">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded p-3 me-3">📚</div>
                    <div>
                      <h6 className="card-title fw-bold text-dark text-truncate mb-1">Bookmarked Post #{bookmark.post.id || bookmark.post}</h6>
                      <small className="text-muted">Saved on {new Date(bookmark.created_at).toLocaleDateString()}</small>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;