import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api/axios';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError('');
    
    try {
      const res = await api.post('auth/google/', {
        token: credentialResponse.credential,
      });

      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('username', res.data.username);
      
      if (res.data.avatar) {
        localStorage.setItem('avatar', res.data.avatar);
      }

      navigate(from, { replace: true });
    } catch (err) {
      console.error("Google login failed:", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('token/', { username: email, password });
      
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('username', email.split('@')[0]); 

      navigate(from, { replace: true });
    } catch (err: any) {
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          
          <div className="text-center mb-4">
            <h2 className="fw-bold">Welcome Back</h2>
            <p className="text-muted">Sign in to continue to Scriptly.</p>
          </div>

          <div className="glass-card p-4 p-md-5 shadow-sm rounded-4 bg-white border">
            
            {error && <div className="alert alert-danger py-2 text-center">{error}</div>}

            <div className="d-flex justify-content-center mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in was closed or failed.')}
                theme="filled_blue"
                size="large"
                shape="rectangular"
                width="100%"
                text="continue_with"
              />
            </div>

            <div className="d-flex align-items-center mb-4">
              <hr className="flex-grow-1 text-muted" />
              <span className="mx-3 text-muted small fw-bold">OR</span>
              <hr className="flex-grow-1 text-muted" />
            </div>

            <form onSubmit={handleStandardSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold small text-muted">Email or Username</label>
                <input
                  type="text"
                  className="form-control form-control-custom py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johndoe or name@example.com"
                  required
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <label className="form-label fw-bold small text-muted">Password</label>
                  <Link to="/forgot-password" className="small text-decoration-none" style={{ color: 'var(--accent-color)' }}>Forgot?</Link>
                </div>
                <div className="input-group password-wrapper">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-control form-control-custom py-2 border-end-0" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                  <button 
                    className="btn btn-outline-secondary bg-white border-start-0" 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-dark w-100 py-2 fw-bold"
                disabled={isLoading}
              >
                {isLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Sign In'}
              </button>
            </form>

            <div className="text-center mt-4 pt-2">
              <span className="text-muted small">Don't have an account? </span>
              <Link to="/register" className="small fw-bold text-decoration-none" style={{ color: 'var(--accent-color)' }}>Sign Up</Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;