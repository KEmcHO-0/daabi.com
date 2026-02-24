import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiThumbsUp, FiMessageCircle, FiEdit, FiTrash2, FiClock, FiEye, FiArrowLeft, FiSend } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { statusLabels, categoryLabels, priorityLabels, formatDateTime, timeAgo } from '../utils/constants';
import toast from 'react-hot-toast';
import './DemandDetail.css';

const DemandDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCommittee } = useAuth();
  const [demand, setDemand] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    fetchDemand();
  }, [id]);

  const fetchDemand = async () => {
    try {
      const res = await api.get(`/demands/${id}`);
      setDemand(res.data.demand);
      setComments(res.data.comments);
      if (user) {
        setIsSupported(res.data.demand.supporters?.some(s => s._id === user._id));
      }
    } catch (error) {
      toast.error('দাবি লোড করতে সমস্যা হয়েছে');
      navigate('/demands');
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = async () => {
    if (!isAuthenticated) {
      toast.error('সমর্থন দিতে লগইন করুন');
      return;
    }

    try {
      const res = await api.post(`/demands/${id}/support`);
      setDemand({ ...demand, supportCount: res.data.supportCount });
      setIsSupported(res.data.isSupported);
      toast.success(res.data.message);
    } catch (error) {
      toast.error('সমস্যা হয়েছে');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      const res = await api.post(`/demands/${id}/comments`, { text: newComment });
      setComments([res.data.comment, ...comments]);
      setNewComment('');
      toast.success('মন্তব্য যোগ হয়েছে!');
    } catch (error) {
      toast.error('মন্তব্য যোগ করতে সমস্যা হয়েছে');
    } finally {
      setCommenting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('এই দাবি মুছে ফেলতে চান?')) return;

    try {
      await api.delete(`/demands/${id}`);
      toast.success('দাবি মুছে ফেলা হয়েছে');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'সমস্যা হয়েছে');
    }
  };

  if (loading) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!demand) return null;

  const isOwner = user && demand.submittedBy?._id === user._id;
  const canEdit = isOwner && demand.status === 'draft';

  return (
    <div className="demand-detail-page">
      <div className="container">
        <Link to="/demands" className="back-link">
          <FiArrowLeft /> সকল দাবিতে ফিরে যান
        </Link>

        <div className="demand-detail-grid">
          {/* Main Content */}
          <div className="demand-main">
            <div className="card">
              <div className="demand-header">
                <div className="demand-badges">
                  <span className={`badge badge-${demand.status}`}>
                    {statusLabels[demand.status]}
                  </span>
                  <span className={`badge badge-${demand.priority}`}>
                    {priorityLabels[demand.priority]} প্রায়োরিটি
                  </span>
                  <span className="badge badge-category">
                    {categoryLabels[demand.category]}
                  </span>
                </div>

                <h1 className="demand-title">{demand.title}</h1>

                <div className="demand-meta">
                  <span>
                    {demand.isAnonymous ? '🔒 বেনামী' : `👤 ${demand.submittedBy?.name}`}
                  </span>
                  <span><FiClock /> {formatDateTime(demand.createdAt)}</span>
                  <span><FiEye /> {demand.viewCount} বার দেখা হয়েছে</span>
                </div>
              </div>

              <div className="demand-body">
                <p className="demand-description">{demand.description}</p>

                {demand.tags?.length > 0 && (
                  <div className="demand-tags">
                    {demand.tags.map((tag, i) => (
                      <span key={i} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}

                {demand.attachments?.length > 0 && (
                  <div className="demand-attachments">
                    <h3>সংযুক্ত ফাইল</h3>
                    <div className="attachments-list">
                      {demand.attachments.map((file, i) => (
                        <a 
                          key={i}
                          href={`http://localhost:5000/${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attachment-item"
                        >
                          📎 {file.originalName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="demand-actions">
                <button 
                  className={`btn ${isSupported ? 'btn-primary' : 'btn-outline'}`}
                  onClick={handleSupport}
                >
                  <FiThumbsUp /> {demand.supportCount} সমর্থন
                </button>

                {canEdit && (
                  <>
                    <Link to={`/edit-demand/${demand._id}`} className="btn btn-outline">
                      <FiEdit /> এডিট
                    </Link>
                    <button className="btn btn-danger" onClick={handleDelete}>
                      <FiTrash2 /> মুছুন
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Committee Response */}
            {demand.committeeResponse && (
              <div className="card committee-response">
                <h3>📋 কমিটির রেসপন্স</h3>
                <p>{demand.committeeResponse}</p>
                {demand.respondedBy && (
                  <div className="response-meta">
                    <span>— {demand.respondedBy.name}</span>
                    <span>{formatDateTime(demand.respondedAt)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Comments Section */}
            <div className="comments-section card">
              <h3><FiMessageCircle /> মন্তব্য ({comments.length})</h3>

              {isAuthenticated ? (
                <form onSubmit={handleComment} className="comment-form">
                  <textarea
                    placeholder="আপনার মন্তব্য লিখুন..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="form-control"
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={commenting || !newComment.trim()}
                  >
                    <FiSend /> {commenting ? 'পাঠানো হচ্ছে...' : 'মন্তব্য করুন'}
                  </button>
                </form>
              ) : (
                <p className="login-prompt">
                  মন্তব্য করতে <Link to="/login">লগইন</Link> করুন
                </p>
              )}

              <div className="comments-list">
                {comments.length === 0 ? (
                  <p className="no-comments">এখনো কোনো মন্তব্য নেই</p>
                ) : (
                  comments.map((comment) => (
                    <div 
                      key={comment._id} 
                      className={`comment ${comment.isCommitteeResponse ? 'committee' : ''}`}
                    >
                      <div className="comment-header">
                        <div className="comment-avatar">
                          {comment.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="comment-author">
                            {comment.user?.name}
                            {comment.isCommitteeResponse && (
                              <span className="committee-badge">কমিটি</span>
                            )}
                          </span>
                          <span className="comment-time">{timeAgo(comment.createdAt)}</span>
                        </div>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="demand-sidebar">
            {/* Status History */}
            <div className="card">
              <h3>📊 স্ট্যাটাস ইতিহাস</h3>
              <div className="status-history">
                {demand.statusHistory?.map((history, i) => (
                  <div key={i} className="history-item">
                    <div className={`history-dot ${history.status}`}></div>
                    <div className="history-content">
                      <span className="history-status">{statusLabels[history.status]}</span>
                      <span className="history-time">{timeAgo(history.changedAt)}</span>
                      {history.comment && (
                        <p className="history-comment">{history.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Author Info */}
            {!demand.isAnonymous && demand.submittedBy && (
              <div className="card">
                <h3>👤 সাবমিটকারী</h3>
                <div className="author-info">
                  <div className="author-avatar">
                    {demand.submittedBy.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="author-name">{demand.submittedBy.name}</p>
                    {demand.submittedBy.department && (
                      <p className="author-dept">{demand.submittedBy.department}</p>
                    )}
                    {demand.submittedBy.batch && (
                      <p className="author-batch">ব্যাচ: {demand.submittedBy.batch}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandDetail;
