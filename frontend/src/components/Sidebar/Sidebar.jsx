import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiLogOut, FiHome, FiUsers } from 'react-icons/fi';
import './Sidebar.css';
import viteLogo from '/vite.svg';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery.trim()}`);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={viteLogo} alt="Logo" className="logo" />
      </div>
      <form onSubmit={handleSearch} className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
      <nav className="sidebar-nav">
        <Link to="/feed" className="nav-item">
          <FiHome className="nav-icon" />
          <span>Feed</span>
        </Link>
        <Link to="/profile" className="nav-item">
          <FiUser className="nav-icon" />
          <span>Profile</span>
        </Link>
        <Link to="/users" className="nav-item">
          <FiUsers className="nav-icon" />
          <span>Users</span>
        </Link>
        {/* Add other navigation items here */}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <FiLogOut className="nav-icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
