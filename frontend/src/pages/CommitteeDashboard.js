import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiClock, FiCheckCircle, FiXCircle, FiTrendingUp, FiSearch, FiFilter, FiEye, FiMessageCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import { statusLabels, categoryLabels, categories, statuses, timeAgo } from '../utils/constants';
import toast from 'react-hot-toast';
import './Dashboard.css';
import './CommitteeDashboard.css';

const CommitteeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [statusModal, setStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    comment: '',
    committeeResponse: '',
    isPublic: false
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [statsRes, demandsRes] = await Promise.all([
        api.get('/demands/stats'),
        api.get(`/demands?${new URLSearchParams(filters).toString()}&limit=20`)
      ]);
      setStats(statsRes.data.stats);
      setDemands(demandsRes.data.demands);
    } catch (error) {
      toast.error('ডাটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate.status) {
      toast.error('স্ট্যাটাস নির্বাচন করুন');
      return;
    }

    try {
      await api.put(`/demands/${selectedDemand._id}/status`, statusUpdate);
      toast.success('স্ট্যাটাস আপডেট হয়েছে!');
      setStatusModal(false);
      setSelectedDemand(null);
      setStatusUpdate({ status: '', comment: '', committeeResponse: '', isPublic: false });
      fetchData();
    } catch (error) {
      toast.error('সমস্যা হয়েছে');
    }
  };

  const COLORS = ['#667eea', '#f093fb', '#4facfe', '#f5576c', '#43e97b', '#fa709a'];

  if (loading) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="committee-dashboard dashboard">
      <div className="container">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>কমিটি ড্যাশবোর্ড 🎯</h1>
            <p>সকল দাবি পরিচালনা করুন</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card primary">
            <div className="stat-icon"><FiFileText /></div>
            <div className="stat-info">
              <div className="stat-value">{stats?.total || 0}</div>
              <div className="stat-label">মোট দাবি</div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon"><FiClock /></div>
            <div className="stat-info">
              <div className="stat-value">{stats?.pending || 0}</div>
              <div className="stat-label">অপেক্ষমান</div>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon"><FiTrendingUp /></div>
            <div className="stat-info">
              <div className="stat-value">{stats?.inProgress || 0}</div>
              <div className="stat-label">চলমান</div>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon"><FiCheckCircle /></div>
            <div className="stat-info">
              <div className="stat-value">{stats?.resolved || 0}</div>
              <div className="stat-label">সমাধান</div>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon"><FiXCircle /></div>
            <div className="stat-info">
              <div className="stat-value">{stats?.avgResolutionDays || 0}</div>
              <div className="stat-label">গড় দিন</div>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="analytics-grid">
          <div className="chart-card card">
            <h3>ক্যাটাগরি অনুযায়ী দাবি</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.byCategory || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoryBn" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card card">
            <h3>স্ট্যাটাস অনুযায়ী</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(stats?.byStatus || {}).map(([key, value]) => ({
                    name: statusLabels[key],
                    value
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {Object.entries(stats?.byStatus || {}).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>সকল দাবি</h2>
          </div>

          <div className="filters-bar">
            <div className="search-wrapper">
              <FiSearch />
              <input
                type="text"
                placeholder="খুঁজুন..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="form-control search-input"
              />
            </div>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="form-control"
            >
              <option value="">সব ক্যাটাগরি</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="form-control"
            >
              <option value="">সব স্ট্যাটাস</option>
              {statuses.map((st) => (
                <option key={st.value} value={st.value}>{st.label}</option>
              ))}
            </select>
          </div>

          {/* Demands Table */}
          <div className="demands-table card">
            <table>
              <thead>
                <tr>
                  <th>শিরোনাম</th>
                  <th>ক্যাটাগরি</th>
                  <th>স্ট্যাটাস</th>
                  <th>সাবমিটকারী</th>
                  <th>সমর্থন</th>
                  <th>তারিখ</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {demands.map((demand) => (
                  <tr key={demand._id}>
                    <td>
                      <Link to={`/demands/${demand._id}`} className="demand-link">
                        {demand.title.substring(0, 40)}...
                      </Link>
                    </td>
                    <td>{categoryLabels[demand.category]}</td>
                    <td>
                      <span className={`badge badge-${demand.status}`}>
                        {statusLabels[demand.status]}
                      </span>
                    </td>
                    <td>
                      {demand.isAnonymous ? 'বেনামী' : demand.submittedBy?.name}
                    </td>
                    <td>{demand.supportCount}</td>
                    <td>{timeAgo(demand.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <Link 
                          to={`/demands/${demand._id}`}
                          className="action-btn"
                          title="দেখুন"
                        >
                          <FiEye />
                        </Link>
                        <button
                          className="action-btn"
                          onClick={() => {
                            setSelectedDemand(demand);
                            setStatusUpdate({ ...statusUpdate, status: demand.status });
                            setStatusModal(true);
                          }}
                          title="স্ট্যাটাস আপডেট"
                        >
                          <FiMessageCircle />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Update Modal */}
        {statusModal && (
          <div className="modal-overlay" onClick={() => setStatusModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">স্ট্যাটাস আপডেট করুন</h3>
              </div>
              <div className="modal-body">
                <p className="modal-demand-title">{selectedDemand?.title}</p>

                <div className="form-group">
                  <label className="form-label">নতুন স্ট্যাটাস *</label>
                  <select
                    className="form-control"
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  >
                    <option value="">নির্বাচন করুন</option>
                    {statuses.map((st) => (
                      <option key={st.value} value={st.value}>{st.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">মন্তব্য</label>
                  <textarea
                    className="form-control"
                    placeholder="স্ট্যাটাস পরিবর্তনের কারণ বা মন্তব্য"
                    value={statusUpdate.comment}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, comment: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">কমিটির রেসপন্স</label>
                  <textarea
                    className="form-control"
                    placeholder="ছাত্রদের জন্য আপনার রেসপন্স"
                    value={statusUpdate.committeeResponse}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, committeeResponse: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={statusUpdate.isPublic}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, isPublic: e.target.checked })}
                    />
                    <span className="checkmark"></span>
                    <span>পাবলিক করুন (সমাধান পেজে দেখাবে)</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-outline"
                  onClick={() => setStatusModal(false)}
                >
                  বাতিল
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleStatusUpdate}
                >
                  আপডেট করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitteeDashboard;
