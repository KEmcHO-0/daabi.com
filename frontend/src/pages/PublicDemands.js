import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import api from '../utils/api';
import { categoryLabels, timeAgo } from '../utils/constants';
import './DemandList.css';

const PublicDemands = () => {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicDemands();
  }, []);

  const fetchPublicDemands = async () => {
    try {
      const res = await api.get('/demands?status=resolved&isPublic=true');
      setDemands(res.data.demands);
    } catch (error) {
      console.error('Failed to fetch public demands');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demand-list-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">✅ সমাধান হয়েছে</h1>
            <p className="page-subtitle">
              সফলভাবে সমাধান হওয়া দাবিগুলো দেখুন
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center" style={{ minHeight: '300px' }}>
            <div className="spinner"></div>
          </div>
        ) : demands.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">📭</div>
            <h3 className="empty-state-title">এখনো কোনো দাবি সমাধান হয়নি</h3>
          </div>
        ) : (
          <div className="demands-grid">
            {demands.map((demand) => (
              <Link 
                to={`/demands/${demand._id}`} 
                key={demand._id} 
                className="demand-card card resolved-card"
              >
                <div className="demand-badges">
                  <span className="badge badge-resolved">
                    <FiCheckCircle /> সমাধান হয়েছে
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
                  <span className="demand-time">{timeAgo(demand.resolvedAt || demand.updatedAt)}</span>
                </div>

                <div className="demand-footer">
                  <span>👍 {demand.supportCount} সমর্থন</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDemands;
