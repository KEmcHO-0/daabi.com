import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiBell, FiUser, FiLogOut, FiGrid, FiPlus, FiChevronDown } from 'react-icons/fi';
import api from '../../utils/api';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isCommittee, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=5');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🎯</span>
          <span className="brand-text">দাবি.com</span>
        </Link>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/demands" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            সকল দাবি
          </Link>
          <Link to="/public" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            সমাধান হয়েছে
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                ড্যাশবোর্ড
              </Link>
              {isCommittee && (
                <Link to="/committee" className="nav-link committee-link" onClick={() => setMobileMenuOpen(false)}>
                  কমিটি প্যানেল
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                লগইন
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileMenuOpen(false)}>
                রেজিস্টার
              </Link>
            </>
          )}
        </div>

        {isAuthenticated && (
          <div className="navbar-actions">
            {/* Create Demand Button */}
            <Link to="/create-demand" className="btn btn-primary btn-sm create-btn">
              <FiPlus /> দাবি করুন
            </Link>

            {/* Notifications */}
            <div className="notif-wrapper" ref={notifRef}>
              <button 
                className="icon-btn"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <FiBell />
                {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
              </button>
              
              {notifOpen && (
                <div className="dropdown-menu notif-dropdown">
                  <div className="dropdown-header">
                    <span>নোটিফিকেশন</span>
                    {unreadCount > 0 && (
                      <button 
                        className="mark-all-btn"
                        onClick={async () => {
                          await api.put('/notifications/read-all');
                          fetchNotifications();
                        }}
                      >
                        সব পড়া হয়েছে
                      </button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">কোনো নোটিফিকেশন নেই</div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                          onClick={() => {
                            markAsRead(notif._id);
                            if (notif.demand) {
                              navigate(`/demands/${notif.demand._id}`);
                            }
                            setNotifOpen(false);
                          }}
                        >
                          <div className="notif-title">{notif.title}</div>
                          <div className="notif-message">{notif.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                  <Link to="/notifications" className="dropdown-footer" onClick={() => setNotifOpen(false)}>
                    সব দেখুন
                  </Link>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button 
                className="user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
                <FiChevronDown />
              </button>

              {userMenuOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-user-info">
                    <div className="user-avatar lg">{user?.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="user-name">{user?.name}</div>
                      <div className="user-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <FiGrid /> ড্যাশবোর্ড
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <FiUser /> প্রোফাইল
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <FiLogOut /> লগআউট
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
