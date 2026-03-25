// src/pages/Settings.tsx
import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const Settings: React.FC = () => {
  useDocumentTitle("Settings");

  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  // 1. Fetch User data (email) on load
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("users/me/"); // Or whatever your auth user endpoint is
        setEmail(response.data.email || "");
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch user data", err);
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // 2. Handle Email Update
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch("users/me/", { email });
      setMessage({ text: "Email updated successfully!", type: "success" });
    } catch (err) {
      setMessage({ text: "Failed to update email.", type: "danger" });
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div className="container mt-5 pt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <h2 className="fw-bold mb-4 text-heading">Account Settings</h2>

          {message.text && (
            <div className={`alert alert-${message.type} py-2 mb-4`}>
              {message.text}
            </div>
          )}

          {/* --- Email Update Section --- */}
          <div className="auth-card mx-auto mb-4" style={{ maxWidth: "100%" }}>
            <h5 className="fw-bold border-bottom pb-3 mb-4">Account Details</h5>
            <form onSubmit={handleUpdateEmail}>
              <div className="mb-4">
                <label className="form-label-custom">Email Address</label>
                <input
                  type="email"
                  className="form-control-custom"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-dark w-100 py-2">
                Update Email
              </button>
            </form>
          </div>

          {/* --- Password Update Section --- */}
          <div className="auth-card mx-auto mb-4" style={{ maxWidth: "100%" }}>
            <h5 className="fw-bold border-bottom pb-3 mb-4">Change Password</h5>
            <form>
              <div className="mb-3">
                <label className="form-label-custom">Current Password</label>
                <input
                  type="password"
                  className="form-control-custom"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">New Password</label>
                <input
                  type="password"
                  className="form-control-custom"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button type="button" className="btn btn-outline-dark w-100 py-2">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
