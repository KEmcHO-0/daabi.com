import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiFileText, FiClock, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi';
import api from '../utils/api';
import { statusLabels, categoryLabels, timeAgo } from '../utils/constants';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [demands, setDemands] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyDemands();
  }, []);

  const fetchMyDemands = async () => {
    try {
      const res = await api.get('/demands?myDemands=true&limit=5');
      setDemands(res.data.demands);
      
      // Calculate stats from demands
      const all = res.data.demands;
      const total = res.data.pagination.total;
      const pending = all.filter(d => d.status === 'pending').length;
      const resolved = all.filter(d => d.status === 'resolved').length;
      const inProgress = all.filter(d => ['under_review', 'in_progress'].includes(d.status)).length;
      
      setStats({ total, pending, resolved, inProgress });
    } catch (error) {
      console.error('Failed to fetch demands');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { icon: <FiFileText />, label: 'মোট দাবি', value: stats.total || 0, color: 'primary' },
    { icon: <FiClock />, label: 'অপেক্ষমান', value: stats.pending || 0, color: 'warning' },
    { icon: <FiTrendingUp />, label: 'চলমান', value: stats.inProgress || 0, color: 'info' },
    { icon: <FiCheckCircle />, label: 'সমাধান', value: stats.resolved || 0, color: 'success' },
  ];

  if (loading) {
    return (
      <div className="container">
        <div className="flex justify-center items-center" style={{ minHeight: '50vh' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>স্বাগতম, {user?.name}! 👋</h1>
            <p>আপনার দাবি ট্র্যাক করুন এবং নতুন দাবি জমা দিন</p>
          </div>
          <Link to="/create-demand" className="btn btn-primary">
            <FiPlus /> নতুন দাবি
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          {statsCards.map((stat, index) => (
            <div key={index} className={`stat-card ${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Demands */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>সাম্প্রতিক দাবিসমূহ</h2>
            <Link to="/demands?myDemands=true" className="view-all-link">
              সব দেখুন →
            </Link>
          </div>

          {demands.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">📝</div>
              <h3 className="empty-state-title">কোনো দাবি নেই</h3>
              <p className="empty-state-text">আপনি এখনো কোনো দাবি জমা দেননি</p>
              <Link to="/create-demand" className="btn btn-primary mt-4">
                <FiPlus /> প্রথম দাবি জমা দিন
              </Link>
            </div>
          ) : (
            <div className="demands-list">
              {demands.map((demand) => (
                <Link to={`/demands/${demand._id}`} key={demand._id} className="demand-card card">
                  <div className="demand-card-header">
                    <span className={`badge badge-${demand.status}`}>
                      {statusLabels[demand.status]}
                    </span>
                    <span className={`badge badge-${demand.priority}`}>
                      {demand.priority === 'urgent' && '🔥'} 
                      {demand.priority === 'high' && '⚠️'}
                      {categoryLabels[demand.category]}
                    </span>
                  </div>
                  <h3 className="demand-title">{demand.title}</h3>
                  <p className="demand-excerpt">
                    {demand.description.substring(0, 100)}...
                  </p>
                  <div className="demand-card-footer">
                    <span className="demand-time">{timeAgo(demand.createdAt)}</span>
                    <div className="demand-stats">
                      <span>👍 {demand.supportCount}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>দ্রুত অ্যাকশন</h2>
          <div className="actions-grid">
            <Link to="/create-demand" className="action-card card">
              <div className="action-icon">📝</div>
              <h3>নতুন দাবি</h3>
              <p>নতুন দাবি বা অভিযোগ জমা দিন</p>
            </Link>
            <Link to="/demands" className="action-card card">
              <div className="action-icon">📋</div>
              <h3>সব দাবি</h3>
              <p>সকল দাবির তালিকা দেখুন</p>
            </Link>
            <Link to="/public" className="action-card card">
              <div className="action-icon">✅</div>
              <h3>সমাধান হয়েছে</h3>
              <p>সমাধান হওয়া দাবিগুলো দেখুন</p>
            </Link>
            <Link to="/profile" className="action-card card">
              <div className="action-icon">👤</div>
              <h3>প্রোফাইল</h3>
              <p>আপনার প্রোফাইল সেটিংস</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
