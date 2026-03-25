import React, { useState, useEffect } from "react";
import api from "../api/axios";

interface Post {
  id: number;
  title: string;
  content: string;
  image: string | null;
  created_at: string;
  author: any;
  status?: string;
  view_count?: number;
}

const Profile: React.FC = () => {
  
  const username = localStorage.getItem("username") || "User";

  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.title = `Scriptly | ${username}`;

    const fetchData = async () => {
      try {
        const profileRes = await api.get("profiles/me/");
        setBio(profileRes.data.bio || "");
        setWebsite(profileRes.data.website || "");
        if (profileRes.data.avatar) setAvatarPreview(profileRes.data.avatar);

        const postsRes = await api.get("posts/");
        const userPosts = postsRes.data.filter((p: any) => {
          const postAuthor = p.author?.username || p.author;
          return postAuthor === username;
        });
        setMyPosts(userPosts);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const formData = new FormData();
    formData.append("bio", bio);
    formData.append("website", website);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      await api.patch("profiles/me/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this article? This cannot be undone.",
      )
    )
      return;
    try {
      await api.delete(`posts/${id}/`);
      setMyPosts(myPosts.filter((post) => post.id !== id));
    } catch (err) {
      alert("Failed to delete post.");
    }
  };

  const startEditingPost = (post: Post) => {
    setEditingPost(post);
    if (post.image) {
      setPostImagePreview(post.image);
    } else {
      setPostImagePreview(null);
    }
    setPostImageFile(null);
  };

  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPostImageFile(file);
      setPostImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setSaving(true);

    const formData = new FormData();
    formData.append("title", editingPost.title);
    formData.append("content", editingPost.content);
    formData.append("status", editingPost.status || "draft");

    if (postImageFile) {
      formData.append("image", postImageFile);
    }

    try {
      const response = await api.patch(`posts/${editingPost.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMyPosts(
        myPosts.map((p) => (p.id === editingPost.id ? response.data : p)),
      );

      setEditingPost(null);
      setPostImageFile(null);
      setPostImagePreview(null);
    } catch (err) {
      alert("Failed to update post.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="container mt-5 pt-4 mb-5 placeholder-glow">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="d-flex align-items-center mb-5 border-bottom pb-4">
              <div
                className="placeholder rounded-circle me-4 bg-secondary"
                style={{ width: "80px", height: "80px" }}
              ></div>
              <div className="w-100">
                <h2 className="placeholder col-4 mb-2 bg-dark rounded"></h2>
                <br />
                <p className="placeholder col-6 mb-0 bg-secondary rounded"></p>
              </div>
            </div>
            <div className="row g-4">
              <div className="col-12 col-md-5">
                <div
                  className="placeholder w-100 rounded bg-secondary"
                  style={{ height: "300px" }}
                ></div>
              </div>
              <div className="col-12 col-md-7">
                <div
                  className="placeholder w-100 rounded bg-secondary"
                  style={{ height: "300px" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="container mt-5 pt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="d-flex align-items-center mb-5 border-bottom pb-4">
            <div
              className="shadow-sm position-relative me-4"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: "var(--accent-color)",
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-100 h-100 object-fit-cover"
                />
              ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold fs-3">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="fw-bold text-heading mb-1">@{username}</h2>
              <p className="text-muted mb-0">
                Manage your profile and publications.
              </p>
            </div>
          </div>

          {message && (
            <div
              className={`alert py-2 ${message.includes("success") ? "alert-success" : "alert-danger"}`}
            >
              {message}
            </div>
          )}

          {editingPost ? (
            <div
              className="auth-card mx-auto shadow-sm"
              style={{ maxWidth: "100%" }}
            >
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <h5 className="fw-bold mb-0">Edit Article</h5>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setEditingPost(null)}
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleUpdatePost}>
                <div className="mb-4">
                  <label className="form-label-custom">Cover Image</label>
                  {postImagePreview && (
                    <div
                      className="mb-3 rounded overflow-hidden shadow-sm"
                      style={{ height: "200px", width: "100%" }}
                    >
                      <img
                        src={postImagePreview}
                        alt="Cover Preview"
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    className="form-control form-control-sm"
                    accept="image/*"
                    onChange={handlePostImageChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label-custom">Title</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    value={editingPost.title}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label-custom">Article Content</label>
                  <textarea
                    className="form-control-custom"
                    rows={12}
                    value={editingPost.content}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        content: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label-custom">Status</label>
                  <select
                    className="form-select form-select-sm form-control-custom"
                    value={editingPost.status || "draft"}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, status: e.target.value })
                    }
                  >
                    <option value="draft">Draft (Hidden)</option>
                    <option value="published">Published (Public)</option>
                  </select>
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-accent px-4 py-2"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="row g-4">
              <div className="col-12 col-md-5">
                <div
                  className="auth-card shadow-sm p-4 h-100"
                  style={{ maxWidth: "100%", padding: "2rem" }}
                >
                  <h6 className="fw-bold border-bottom pb-2 mb-4">
                    Profile Details
                  </h6>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="mb-3">
                      <label
                        className="form-label-custom text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Avatar
                      </label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        className="form-label-custom text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Bio
                      </label>
                      <textarea
                        className="form-control-custom"
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        className="form-label-custom text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Website
                      </label>
                      <input
                        type="url"
                        className="form-control-custom"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-dark w-100 py-2 btn-sm"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Update Profile"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-12 col-md-7">
                <div
                  className="auth-card shadow-sm p-0 h-100 overflow-hidden"
                  style={{ maxWidth: "100%" }}
                >
                  <div className="p-4 border-bottom bg-light">
                    <h6 className="fw-bold mb-0">
                      My Articles ({myPosts.length})
                    </h6>
                  </div>

                  {myPosts.length === 0 ? (
                    <div className="p-5 text-center text-muted">
                      You haven't published anything yet.
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {myPosts.map((post) => (
                        <div
                          key={post.id}
                          className="list-group-item d-flex align-items-center p-3 hover-bg-light transition-all"
                        >
                          {post.image ? (
                            <img
                              src={post.image}
                              alt={post.title}
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                              className="me-3 shadow-sm"
                            />
                          ) : (
                            <div
                              style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "8px",
                                backgroundColor: "#e9ecef",
                              }}
                              className="me-3 shadow-sm d-flex align-items-center justify-content-center"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                className="bi bi-image text-muted"
                                viewBox="0 0 16 16"
                              >
                                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-grow-1 min-w-0 me-3">
                            <div className="d-flex align-items-center mb-1">
                              <h6 className="mb-0 fw-bold text-truncate text-dark">
                                {post.title}
                              </h6>
                              <span
                                className={`badge ms-2 ${post.status === "published" ? "bg-success" : "bg-secondary"}`}
                                style={{ fontSize: "0.65rem" }}
                              >
                                {post.status === "published"
                                  ? "Published"
                                  : "Draft"}
                              </span>
                            </div>
                            <small className="text-muted">
                              {new Date(post.created_at).toLocaleDateString()}{" "}
                              &middot; {post.view_count || 0} Views
                            </small>
                          </div>
                          <div className="d-flex flex-column gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary py-0 px-3"
                              onClick={() => startEditingPost(post)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger py-0 px-3"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
