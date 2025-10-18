import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiUser,
  FiLogOut,
  FiHome,
  FiUsers,
  FiBarChart2,
  FiMenu,
  FiX
} from 'react-icons/fi';
import './Sidebar.css';
import logo from '../../assets/logo.png';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery.trim()}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Bouton hamburger visible sur mobile */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Overlay sombre derrière la sidebar */}
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar principale */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="logo" />
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

        <nav className="sidebar-nav" onClick={() => setIsOpen(false)}>
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

          {isAdmin && (
            <Link to="/dashboard" className="nav-item nav-item-admin">
              <FiBarChart2 className="nav-icon" />
              <span>Dashboard</span>
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <FiLogOut className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
