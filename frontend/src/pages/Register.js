import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiHash, FiBook, FiCalendar } from 'react-icons/fi';
import { departments } from '../utils/constants';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    department: '',
    batch: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('পাসওয়ার্ড মিলছে না');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        studentId: formData.studentId,
        department: formData.department,
        batch: formData.batch
      });
      toast.success('রেজিস্ট্রেশন সফল! ইমেইল ভেরিফাই করুন।');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'রেজিস্ট্রেশনে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card card register-card">
          <div className="auth-header">
            <div className="auth-icon">📝</div>
            <h1>রেজিস্টার করুন</h1>
            <p>নতুন অ্যাকাউন্ট তৈরি করুন</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">পূর্ণ নাম *</label>
                <div className="input-icon-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="আপনার নাম"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">স্টুডেন্ট আইডি</label>
                <div className="input-icon-wrapper">
                  <FiHash className="input-icon" />
                  <input
                    type="text"
                    name="studentId"
                    className="form-control"
                    placeholder="যেমন: 2019331001"
                    value={formData.studentId}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ইমেইল *</label>
              <div className="input-icon-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="আপনার ইমেইল"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">বিভাগ</label>
                <div className="input-icon-wrapper">
                  <FiBook className="input-icon" />
                  <select
                    name="department"
                    className="form-control"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">বিভাগ নির্বাচন করুন</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ব্যাচ</label>
                <div className="input-icon-wrapper">
                  <FiCalendar className="input-icon" />
                  <input
                    type="text"
                    name="batch"
                    className="form-control"
                    placeholder="যেমন: 19"
                    value={formData.batch}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">পাসওয়ার্ড *</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-control"
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    value={formData.password}
                    onChange={handleChange}
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
                <label className="form-label">পাসওয়ার্ড নিশ্চিত করুন *</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="form-control"
                    placeholder="পাসওয়ার্ড আবার দিন"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? 'অপেক্ষা করুন...' : 'রেজিস্টার করুন'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              অ্যাকাউন্ট আছে? <Link to="/login">লগইন করুন</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
