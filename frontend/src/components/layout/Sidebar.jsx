import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const exchangeSubmenu = [
    { path: '/exchange', label: 'My Exchanges', icon: '🔄' },
    { path: '/exchange/requests', label: 'Requests', icon: '📬' },
    { path: '/exchange/suggestions', label: 'Suggestions', icon: '💡' },
    { path: '/exchange/create-request', label: 'New Request', icon: '➕' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>Exchange</h3>
        <ul>
          {exchangeSubmenu.map(item => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="sidebar-section">
        <h3>Library</h3>
        <ul>
          <li>
            <Link 
              to="/books/my-library" 
              className={location.pathname === '/books/my-library' ? 'active' : ''}
            >
              <span className="icon">📚</span>
              My Books
            </Link>
          </li>
          <li>
            <Link 
              to="/library/wanted-books" 
              className={location.pathname === '/library/wanted-books' ? 'active' : ''}
            >
              <span className="icon">🎯</span>
              Wanted Books
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;