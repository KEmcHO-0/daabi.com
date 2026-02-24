import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../utils/api';
import { statusLabels, categoryLabels, priorityLabels, categories, statuses, timeAgo } from '../utils/constants';
import './DemandList.css';

const DemandList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    myDemands: searchParams.get('myDemands') || ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDemands();
  }, [searchParams]);

  const fetchDemands = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      if (!params.get('limit')) params.set('limit', '12');
      
      const res = await api.get(`/demands?${params.toString()}`);
      setDemands(res.data.demands);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch demands');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', filters.search);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', status: '', myDemands: '' });
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="demand-list-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">সকল দাবি</h1>
            <p className="page-subtitle">
              {pagination.total || 0}টি দাবি পাওয়া গেছে
            </p>
          </div>
          <button 
            className="btn btn-outline filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> ফিল্টার
          </button>
        </div>

        {/* Search & Filters */}
        <div className={`filters-section card ${showFilters ? 'show' : ''}`}>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <FiSearch />
              <input
                type="text"
                placeholder="দাবি খুঁজুন..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">খুঁজুন</button>
          </form>

          <div className="filter-options">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="form-control"
            >
              <option value="">সব ক্যাটাগরি</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-control"
            >
              <option value="">সব স্ট্যাটাস</option>
              {statuses.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>

            {(filters.category || filters.status || filters.search) && (
              <button 
                className="btn btn-outline btn-sm"
                onClick={clearFilters}
              >
                ফিল্টার মুছুন
              </button>
            )}
          </div>
        </div>

        {/* Demands Grid */}
        {loading ? (
          <div className="flex justify-center items-center" style={{ minHeight: '300px' }}>
            <div className="spinner"></div>
          </div>
        ) : demands.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">কোনো দাবি পাওয়া যায়নি</h3>
            <p className="empty-state-text">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
          </div>
        ) : (
          <>
            <div className="demands-grid">
              {demands.map((demand) => (
                <Link 
                  to={`/demands/${demand._id}`} 
                  key={demand._id} 
                  className="demand-card card"
                >
                  <div className="demand-badges">
                    <span className={`badge badge-${demand.status}`}>
                      {statusLabels[demand.status]}
                    </span>
                    <span className={`badge badge-${demand.priority}`}>
                      {priorityLabels[demand.priority]}
                    </span>
                  </div>

                  <span className="demand-category">
                    {categoryLabels[demand.category]}
                  </span>

                  <h3 className="demand-title">{demand.title}</h3>
                  
                  <p className="demand-excerpt">
                    {demand.description.substring(0, 120)}...
                  </p>

                  <div className="demand-meta">
                    <span className="demand-author">
                      {demand.isAnonymous ? '🔒 বেনামী' : `👤 ${demand.submittedBy?.name}`}
                    </span>
                    <span className="demand-time">{timeAgo(demand.createdAt)}</span>
                  </div>

                  <div className="demand-footer">
                    <span>👍 {demand.supportCount} সমর্থন</span>
                    <span>👁️ {demand.viewCount} দেখা হয়েছে</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <FiChevronLeft />
                </button>

                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        className={`pagination-btn ${page === pagination.page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === 2 || page === pagination.pages - 1) {
                    return <span key={page} className="pagination-dots">...</span>;
                  }
                  return null;
                })}

                <button
                  className="pagination-btn"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DemandList;
