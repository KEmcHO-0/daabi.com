import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card card">
            <div className="auth-message">
              <div className="icon">📧</div>
              <h2>ইমেইল পাঠানো হয়েছে!</h2>
              <p>
                পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে। 
                ইমেইল চেক করুন এবং লিংকে ক্লিক করুন।
              </p>
              <Link to="/login" className="btn btn-primary">
                লগইনে ফিরে যান
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-header">
            <div className="auth-icon">🔑</div>
            <h1>পাসওয়ার্ড ভুলে গেছেন?</h1>
            <p>আপনার ইমেইল দিন, রিসেট লিংক পাঠানো হবে</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">ইমেইল</label>
              <div className="input-icon-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  className="form-control"
                  placeholder="আপনার ইমেইল দিন"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? 'অপেক্ষা করুন...' : 'রিসেট লিংক পাঠান'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login" className="flex items-center justify-center gap-2">
              <FiArrowLeft /> লগইনে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
