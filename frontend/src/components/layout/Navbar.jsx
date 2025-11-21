import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">BookExchange</Link>
      </div>
      
      <div className="nav-links">
        <Link 
          to="/books" 
          className={location.pathname === '/books' ? 'active' : ''}
        >
          Browse Books
        </Link>
        
        {isAuthenticated && (
          <>
            <Link 
              to="/exchange" 
              className={location.pathname.startsWith('/exchange') ? 'active' : ''}
            >
              Exchanges
            </Link>
            
            <Link 
              to="/exchange/suggestions" 
              className={location.pathname === '/exchange/suggestions' ? 'active' : ''}
            >
              Suggestions
            </Link>
            
            <Link 
              to="/messages" 
              className={location.pathname.startsWith('/messages') ? 'active' : ''}
            >
              Messages
            </Link>
            
            <Link 
              to="/books/my-library" 
              className={location.pathname === '/books/my-library' ? 'active' : ''}
            >
              My Library
            </Link>
          </>
        )}
      </div>
      
      <div className="nav-user">
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="user-profile">
              <img src={user?.avatar_url} alt={user?.full_name} />
              <span>{user?.full_name}</span>
            </Link>
          </>
        ) : (
          <div className="auth-links">
            <Link to="/auth/login">Login</Link>
            <Link to="/auth/register" className="btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;