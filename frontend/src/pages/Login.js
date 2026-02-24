import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('লগইন সফল!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'লগইনে সমস্যা হয়েছে');
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
            <h1>স্বাগতম!</h1>
            <p>আপনার অ্যাকাউন্টে লগইন করুন</p>
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

            <div className="form-group">
              <label className="form-label">পাসওয়ার্ড</label>
              <div className="input-icon-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="আপনার পাসওয়ার্ড দিন"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            <div className="form-options">
              <Link to="/forgot-password" className="forgot-link">
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? 'অপেক্ষা করুন...' : 'লগইন করুন'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              অ্যাকাউন্ট নেই? <Link to="/register">রেজিস্টার করুন</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
