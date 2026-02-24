import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('পাসওয়ার্ড মিলছে না');
      return;
    }

    if (password.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    setLoading(true);

    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('পাসওয়ার্ড রিসেট সফল!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-header">
            <div className="auth-icon">🔐</div>
            <h1>নতুন পাসওয়ার্ড দিন</h1>
            <p>আপনার নতুন পাসওয়ার্ড সেট করুন</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">নতুন পাসওয়ার্ড</label>
              <div className="input-icon-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">পাসওয়ার্ড নিশ্চিত করুন</label>
              <div className="input-icon-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="পাসওয়ার্ড আবার দিন"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? 'অপেক্ষা করুন...' : 'পাসওয়ার্ড রিসেট করুন'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login">লগইনে ফিরে যান</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
