import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

interface Category {
  id: number;
  name: string;
}

const CreatePost: React.FC = () => {
  useDocumentTitle("Create Post");
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "background",
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("categories/");
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    if (categoryId) {
      formData.append("category", categoryId);
    }

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await api.post("posts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/profile");
    } catch (err: any) {
      console.error("Post creation failed", err);
      setError(
        err.response?.data?.detail ||
          "Failed to publish article. Make sure you are logged in.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 pt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <h2 className="fw-bold text-heading mb-0">Write a New Article</h2>
            <Link to="/" className="btn btn-outline-secondary btn-sm">
              Cancel
            </Link>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div
            className="auth-card mx-auto shadow-sm"
            style={{ maxWidth: "100%" }}
          >
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label-custom">Cover Image</label>
                {imagePreview && (
                  <div
                    className="mb-3 rounded overflow-hidden shadow-sm"
                    style={{ height: "250px", width: "100%" }}
                  >
                    <img
                      src={imagePreview}
                      alt="Cover Preview"
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  className="form-control form-control-sm"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <div className="mb-4">
                <label className="form-label-custom">Article Title</label>
                <input
                  type="text"
                  className="form-control-custom fs-5 fw-bold"
                  placeholder="Enter a captivating title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label-custom">Category</label>
                <select
                  className="form-select form-control-custom"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Select a category (Optional)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Article Content</label>
                <div className="quill-container">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    placeholder="Write your story here..."
                    modules={quillModules}
                    formats={quillFormats}
                  />
                </div>
              </div>

              <div className="d-grid mt-5">
                <button
                  type="submit"
                  className="btn btn-accent px-5 py-3 fw-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? "Publishing..." : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
