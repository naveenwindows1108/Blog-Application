import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

interface Category {
  id: number;
  name: string;
  slug: string;
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const isLoggedIn = !!localStorage.getItem('access_token');
  const username = localStorage.getItem('username') || 'My Account';
  const avatar = localStorage.getItem('avatar');
  const [searchInput, setSearchInput] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('categories/');
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput(''); 
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white py-3 sticky-top border-bottom border-light">
        <div className="container">
          
          <Link className="navbar-brand" to="/" style={{ textDecoration: 'none' }}>
            <div className="d-flex align-items-center logo-container">
              <div style={{ width: '14px', height: '14px', backgroundColor: 'var(--accent-color)', marginRight: '12px', borderRadius: '3px' }}></div>
              <span className="fw-bold scriptly-logo-text" style={{ fontSize: '1.3rem', transition: 'color 0.3s' }}>
                SCRIPT<span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>LY</span>
              </span>
            </div>
          </Link>

          <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#topNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="topNav">
            <ul className="navbar-nav ms-auto align-items-lg-center mt-3 mt-lg-0">
              
              <li className="nav-item me-lg-3 mb-3 mb-lg-0">
                <form onSubmit={handleSearchSubmit} className="d-flex align-items-center w-100">
                  <div className="input-group input-group-sm w-100" style={{ maxWidth: '280px' }}>
                    <input 
                      type="text" 
                      className="form-control form-control-custom border-end-0 shadow-none" 
                      placeholder="Search articles..." 
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      style={{ borderRight: 'none', backgroundColor: 'var(--bg-main)' }}
                    />
                    <button className="btn border border-start-0 d-flex align-items-center" type="submit" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-muted)', color: 'var(--text-main)' }}>
                      <i className="bi bi-search" style={{ fontSize: '0.85rem' }}></i>
                    </button>
                  </div>
                </form>
              </li>
              
              <li className="nav-item me-lg-4 mb-3 mb-lg-0">
                <button 
                  onClick={toggleDarkMode} 
                  className="btn btn-sm btn-outline-secondary fw-bold rounded-pill p-0 d-flex align-items-center justify-content-center" 
                  style={{ width: '36px', height: '36px', border: '1px solid var(--border-muted)', transition: 'all 0.2s ease' }}
                >
                  {isDarkMode ? (
                    <i className="bi bi-sun-fill fs-6 text-warning" style={{ color: '#F6E05E' }}></i>
                  ) : (
                    <i className="bi bi-moon-stars-fill fs-6 text-secondary" style={{ color: '#A0AEC0' }}></i>
                  )}
                </button>
              </li>

              {!isLoggedIn ? (
                <>
                  <li className="nav-item me-lg-4 mb-2 mb-lg-0">
                    <Link className="nav-link" style={{ fontSize: '0.9rem' }} to="/login">Sign In</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="btn btn-accent shadow-sm d-block w-100 d-lg-inline-block" to="/register">Get Started</Link>
                  </li>
                </>
              ) : (
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ fontWeight: 600 }}>
                    {avatar ? (
                      <img src={avatar} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '10px' }} />
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', fontSize: '0.85rem' }}>
                        {username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {username}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-light mt-2 rounded-3 bg-white" aria-labelledby="navbarDropdown">
                    <li><Link className="dropdown-item py-2 text-dark" to="/profile">My Profile</Link></li>
                    <li><Link className="dropdown-item py-2 text-dark" to="/settings">Settings</Link></li>
                    <li><hr className="dropdown-divider my-1 border-muted" /></li>
                    <li>
                      <button className="dropdown-item py-2 text-danger fw-bold bg-transparent" onClick={handleLogout}>Sign Out</button>
                    </li>
                  </ul>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {location.pathname === '/' && (
        <div className="bg-white w-100 shadow-sm" style={{ position: 'relative', zIndex: 1010 }}>
          <div className="container">
            <div className="category-nav d-flex align-items-center pt-1 overflow-auto" style={{ whiteSpace: 'nowrap' }}>
              
              <Link to="/" className={`category-link text-uppercase ${!currentCategory && !searchParams.get('search') ? 'active' : ''}`}>
                ALL POSTS
              </Link>
              
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  to={`/?category=${category.slug}`} 
                  className={`category-link text-uppercase ${currentCategory === category.slug ? 'active' : ''}`}
                >
                  {category.name}
                </Link>
              ))}

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;