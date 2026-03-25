// src/pages/Register.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const Register: React.FC = () => {
  useDocumentTitle("Register");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Send new user data to Django (Adjust 'register/' if your URL is different)
      await api.post("register/", {
        username,
        email,
        password,
      });

      // 2. On success, send them to the login page to sign in
      navigate("/login");
    } catch (err: any) {
      console.error("Registration error:", err);
      // Catch specific errors (like "Username already exists")
      const errorMessage =
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        "Failed to create account. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-2" style={{ color: "var(--text-heading)" }}>
            Join Scriptly
          </h2>
          <p className="text-muted" style={{ fontSize: "0.95rem" }}>
            Create an account to start publishing and saving articles.
          </p>
        </div>

        {/* Display Error Message if registration fails */}
        {error && (
          <div
            className="alert alert-danger py-2"
            style={{ fontSize: "0.9rem" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label-custom">Username</label>
            <input
              type="text"
              className="form-control-custom"
              placeholder="e.g. alex_developer"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label-custom">Email Address</label>
            <input
              type="email"
              className="form-control-custom"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label-custom">Password</label>
            <input
              type="password"
              className="form-control-custom"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-accent w-100 py-2 mb-4"
            disabled={isLoading}
            style={{ fontSize: "1rem" }}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p
          className="text-center text-muted mb-0"
          style={{ fontSize: "0.9rem" }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="fw-bold text-decoration-none"
            style={{ color: "var(--text-heading)" }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
