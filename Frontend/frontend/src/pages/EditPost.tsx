import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const EditPost: React.FC = () => {
  useDocumentTitle("Edit Post");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("categories/");
      return response.data;
    },
    staleTime: 1000 * 60 * 60,
  });

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const response = await api.get(`posts/${id}/`);
      return response.data;
    },
  });

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      const catId =
        typeof post.category === "object" && post.category !== null
          ? post.category.id
          : post.category;
      setCategory(catId || "");
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (category) formData.append("category", category);
      if (image) formData.append("image", image);

      await api.patch(`posts/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", id] });

      navigate(`/post/${id}`);
    } catch (err) {
      console.error("Failed to update post:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="text-center py-5 mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  if (isError)
    return (
      <div className="alert alert-danger text-center mt-5">
        Post not found or you don't have permission to edit it.
      </div>
    );

  return (
    <div className="container py-5 mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-dark mb-0">Edit Article</h2>
            <button
              className="btn btn-outline-secondary btn-sm rounded-pill px-3"
              onClick={() => navigate(`/post/${id}`)}
            >
              Cancel
            </button>
          </div>

          <div className="glass-card p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label-custom">Article Title</label>
                <input
                  type="text"
                  className="form-control form-control-custom fs-5 fw-bold"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a captivating title..."
                  required
                />
              </div>

              <div className="row mb-4 g-3">
                <div className="col-md-6">
                  <label className="form-label-custom">Category</label>
                  <select
                    className="form-select form-control-custom"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">
                    Update Cover Image (Optional)
                  </label>
                  <input
                    type="file"
                    className="form-control form-control-custom"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImage(e.target.files[0]);
                      }
                    }}
                  />
                  <div
                    className="form-text mt-1"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Leave blank to keep current image.
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <label className="form-label-custom">Article Body</label>
                <textarea
                  className="form-control form-control-custom"
                  rows={15}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your amazing article here..."
                  style={{ resize: "vertical", lineHeight: "1.6" }}
                  required
                />
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-accent px-5 py-2 fw-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    "Update Article"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
