import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { optimizeCloudinaryUrl } from "../utils/optimizeImage";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

interface PostDetail {
  id: number;
  title: string;
  content: string;
  category: any;
  created_at: string;
  image: string | null;
  view_count: number;
  author?: any;
  tags?: any[];
  likes?: any[];
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: any;
  post: number;
}

const SinglePost: React.FC = () => {
  useDocumentTitle("Post");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

 
  const { data: post, isLoading } = useQuery<PostDetail>({
    queryKey: ["post", id],
    queryFn: async () => {
      const response = await api.get(`posts/${id}/`);
      return response.data;
    },
    initialData: () => {
      const allPosts = queryClient.getQueryData<PostDetail[]>(["posts"]);
      const cachedPost = allPosts?.find((p) => String(p.id) === String(id));
      if (cachedPost) {
        return cachedPost;
      }
      return undefined;
    },
  });


  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const currentLoggedInUser = localStorage.getItem("username");
  const isLoggedIn = !!localStorage.getItem("access_token");


  useEffect(() => {
    if (post && post.likes) {
      setLikesCount(post.likes.length);
      const userLiked = post.likes.some(
        (like: any) =>
          like.user?.username === currentLoggedInUser ||
          like.user === currentLoggedInUser,
      );
      setHasLiked(userLiked);
    }
  }, [post, currentLoggedInUser]);

 
  useEffect(() => {
    if (post) {
      document.title = `Scriptly | ${post.title}`;
    } else {
      document.title = "Blog";
    }

    const fetchComments = async () => {
      try {
        const commentResponse = await api.get("comments/");
        const thisPostComments = commentResponse.data.filter(
          (c: any) =>
            String(c.post) === String(id) || String(c.post?.id) === String(id),
        );
        setComments(thisPostComments);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    fetchComments();
  }, [id, post]);

  const { data: relatedPosts } = useQuery<PostDetail[]>({
    queryKey: ["relatedPosts", id],
    queryFn: async () => {
      const response = await api.get(`posts/${id}/related/`);
      return response.data;
    },
    enabled: !!id,
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("🔗 Article link copied to clipboard!");
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      const response = await api.post(`posts/${id}/like/`);
      if (response.data.message === "Liked") {
        setHasLiked(true);
        setLikesCount((prev) => prev + 1);
      } else {
        setHasLiked(false);
        setLikesCount((prev) => prev - 1);
      }
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      const response = await api.post(`posts/${id}/bookmark/`);
      if (response.data.message === "Bookmarked") {
        setIsBookmarked(true);
      } else {
        setIsBookmarked(false);
      }
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    }
  };

  const handleCommentClick = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location.pathname } });
    } else {
      setShowComments(!showComments);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!newComment.trim()) return;

    try {
      const response = await api.post("comments/", {
        post: id,
        content: newComment,
      });
      setComments([...comments, response.data]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment", err);
      alert("Failed to post comment. Please try again.");
    }
  };

  if (isLoading)
    return (
      <article className="pb-5 mb-5 mt-5 container">
        <div className="article-container placeholder-glow">
          <span className="placeholder col-2 mb-3 bg-secondary rounded"></span>
          <h1 className="placeholder col-8 mb-4 bg-dark rounded"></h1>
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="placeholder rounded-circle bg-secondary"
              style={{ width: "48px", height: "48px" }}
            ></div>
            <div className="w-100">
              <div className="placeholder col-3 mb-1 bg-dark rounded"></div>
              <br />
              <div className="placeholder col-4 bg-secondary rounded"></div>
            </div>
          </div>
          <div
            className="placeholder w-100 rounded mb-4"
            style={{ height: "400px", backgroundColor: "#e2e8f0" }}
          ></div>
          <div className="mt-4">
            <p className="placeholder col-12 bg-secondary rounded"></p>
            <p className="placeholder col-10 bg-secondary rounded"></p>
            <p className="placeholder col-11 bg-secondary rounded"></p>
          </div>
        </div>
      </article>
    );

  if (!post)
    return (
      <div className="container mt-5 text-center alert alert-danger">
        Post not found.
      </div>
    );

  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const displayImage = post.image ? optimizeCloudinaryUrl(post.image) : null;
  const categoryName =
    typeof post.category === "object" && post.category !== null
      ? post.category.name
      : post.category || "Uncategorized";

  const authorName =
    post.author?.username || post.author || "Loading Author...";
  const isAuthor = currentLoggedInUser === authorName;
  const authorAvatar = `https://ui-avatars.com/api/?name=${authorName}&background=5A67D8&color=fff&rounded=true&size=128`;
  const wordCount = post.content.split(" ").length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200)) + " min read";

  return (
    <article
      className="pb-5 mb-5 mt-5 container"
      style={{ maxWidth: "100vw", overflowX: "hidden" }}
    >
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="article-container w-100" style={{ maxWidth: "100%" }}>
            <span
              className="category-label mb-3 d-inline-block text-uppercase"
              style={{ letterSpacing: "1px" }}
            >
              {categoryName}
            </span>

            <h1 className="article-title-pro text-start">{post.title}</h1>

            {isAuthor && (
              <div className="mt-3">
                <button
                  className="btn btn-sm btn-outline-primary fw-bold"
                  onClick={() => navigate(`/edit-post/${post.id}`)}
                >
                  Edit Article
                </button>
              </div>
            )}

            <div className="author-meta-strip">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="meta-avatar"
                />
                <div className="text-start">
                  <div className="fw-bold text-dark fs-6">{authorName}</div>
                  <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                    {formattedDate} · {readTime} · {post.view_count} Views
                  </div>
                </div>
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="tags-header-container">
                <span
                  className="fw-bold text-muted me-2"
                  style={{
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Tags:
                </span>
                {post.tags.map((tag: any, index: number) => {
                  const tagName = typeof tag === "object" ? tag.name : tag;
                  return (
                    <span key={index} className="tag-pill">
                      {tagName}
                    </span>
                  );
                })}
              </div>
            )}

            {displayImage && (
              <div className="hero-image-wrapper">
                <img
                  src={displayImage}
                  alt={post.title}
                  className="w-100 h-100 object-fit-cover"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />
              </div>
            )}

            <div
              className="text-start article-body-pro mt-4"
              style={{
                width: "100%",
                maxWidth: "100%",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                whiteSpace: "normal",
                overflowX: "hidden",
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="d-flex align-items-center justify-content-between border-top border-bottom py-3 mt-5 mb-4">
              <div className="d-flex gap-4">
                <button
                  onClick={handleLike}
                  className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2 transition-all"
                  style={{ color: hasLiked ? "#e63946" : "#6c757d" }}
                >
                  {hasLiked ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  )}
                  <span className="fw-bold fs-6">{likesCount}</span>
                </button>

                <button
                  onClick={handleCommentClick}
                  className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2 transition-all"
                  style={{ color: showComments ? "#5A67D8" : "#6c757d" }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <span className="fw-bold fs-6">{comments.length}</span>
                </button>
              </div>

              <div className="d-flex gap-4">
                <button
                  onClick={handleBookmark}
                  className="btn btn-link text-decoration-none p-0 d-flex align-items-center"
                  style={{ color: isBookmarked ? "#5A67D8" : "#6c757d" }}
                  title="Bookmark"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill={isBookmarked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>

                <button
                  onClick={handleShare}
                  className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2"
                  style={{ color: "#6c757d" }}
                  title="Copy Link"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button>
              </div>
            </div>

            {showComments && (
              <div id="comments-section" className="mt-4 animate-fade-in">
                <h5 className="fw-bold mb-4">Responses ({comments.length})</h5>

                {isLoggedIn ? (
                  <div className="mb-5">
                    <form onSubmit={handleCommentSubmit}>
                      <textarea
                        className="form-control-custom mb-3"
                        rows={3}
                        placeholder="What are your thoughts?"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        style={{
                          backgroundColor: "var(--bg-surface)",
                          border: "1px solid var(--border-muted)",
                        }}
                      />
                      <div className="d-flex justify-content-end">
                        <button
                          type="submit"
                          className="btn btn-accent btn-sm px-4 fw-bold"
                          disabled={!newComment.trim()}
                        >
                          Respond
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="alert alert-light border text-center mb-5 py-4 rounded-3">
                    <h6 className="fw-bold mb-2">Join the conversation</h6>
                    <p className="text-muted small mb-3">
                      Log in to share your thoughts and join the discussion.
                    </p>
                    <button
                      onClick={() =>
                        navigate("/login", {
                          state: { from: location.pathname },
                        })
                      }
                      className="btn btn-primary px-4 py-2 rounded-pill fw-bold"
                    >
                      Login to Comment
                    </button>
                  </div>
                )}

                <div className="d-flex flex-column gap-4">
                  {comments.length === 0 ? (
                    <p className="text-muted fst-italic">
                      No responses yet. Be the first to share your thoughts!
                    </p>
                  ) : (
                    comments.map((comment) => {
                      const commenterName =
                        comment.user?.username ||
                        comment.user ||
                        "Anonymous User";
                      const commentAvatar = `https://ui-avatars.com/api/?name=${commenterName}&background=f1f5f9&color=475569&rounded=true`;

                      return (
                        <div
                          key={comment.id}
                          className="d-flex gap-3 pb-4 border-bottom border-light"
                        >
                          <img
                            src={commentAvatar}
                            alt={commenterName}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                            }}
                          />
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span
                                className="fw-bold text-dark"
                                style={{ fontSize: "0.95rem" }}
                              >
                                {commenterName}
                              </span>
                              <span
                                className="text-muted"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {new Date(
                                  comment.created_at,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p
                              className="text-muted mb-0"
                              style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
                            >
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {relatedPosts && relatedPosts.length > 0 && (
              <div className="mt-5 pt-5 border-top border-light">
                <h4
                  className="fw-bold mb-4"
                  style={{ color: "var(--text-heading)" }}
                >
                  More from {categoryName}
                </h4>
                <div className="row g-4">
                  {relatedPosts.map((relatedPost) => {
                    const relatedPostImage = optimizeCloudinaryUrl(
                      relatedPost.image,
                    );
                    return (
                      <div key={relatedPost.id} className="col-12 col-md-4">
                        <div
                          className="card h-100 shadow-sm border-0 hover-scale"
                          onClick={() => {
                            navigate(`/post/${relatedPost.id}`);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          style={{
                            cursor: "pointer",
                            transition: "transform 0.2s",
                          }}
                        >
                          {relatedPostImage && (
                            <img
                              src={relatedPostImage}
                              className="card-img-top"
                              alt={relatedPost.title}
                              style={{ height: "160px", objectFit: "cover" }}
                            />
                          )}
                          <div className="card-body">
                            <h6 className="card-title fw-bold text-dark text-truncate mb-1">
                              {relatedPost.title}
                            </h6>
                            <small className="text-muted">
                              {new Date(
                                relatedPost.created_at,
                              ).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default SinglePost;
