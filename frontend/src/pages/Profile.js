import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiHash, FiBook, FiCalendar, FiLock, FiSave } from 'react-icons/fi';
import { departments } from '../utils/constants';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    batch: user?.batch || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [saving, setSaving] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfile(profileData);
      toast.success('প্রোফাইল আপডেট হয়েছে!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('নতুন পাসওয়ার্ড মিলছে না');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    setSaving(true);

    try {
      await api.put('/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('পাসওয়ার্ড পরিবর্তন হয়েছে!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">প্রোফাইল সেটিংস</h1>
          <p className="page-subtitle">আপনার তথ্য আপডেট করুন</p>
        </div>

        <div className="profile-grid">
          {/* Sidebar */}
          <div className="profile-sidebar card">
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h3 className="profile-name">{user?.name}</h3>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-meta">
              {user?.studentId && (
                <span><FiHash /> {user.studentId}</span>
              )}
              {user?.department && (
                <span><FiBook /> {user.department}</span>
              )}
              {user?.batch && (
                <span><FiCalendar /> ব্যাচ {user.batch}</span>
              )}
            </div>
            <div className={`role-badge ${user?.role}`}>
              {user?.role === 'student' && '👨‍🎓 ছাত্র'}
              {user?.role === 'committee' && '👔 কমিটি সদস্য'}
              {user?.role === 'admin' && '🔑 অ্যাডমিন'}
            </div>
          </div>

          {/* Main Content */}
          <div className="profile-main">
            <div className="profile-tabs">
              <button
                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FiUser /> প্রোফাইল
              </button>
              <button
                className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <FiLock /> পাসওয়ার্ড
              </button>
            </div>

            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="card profile-form">
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">পূর্ণ নাম</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ইমেইল</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email}
                      disabled
                    />
                    <small className="form-hint">ইমেইল পরিবর্তন করা যাবে না</small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">স্টুডেন্ট আইডি</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.studentId || ''}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">বিভাগ</label>
                    <select
                      className="form-control"
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    >
                      <option value="">বিভাগ নির্বাচন করুন</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">ব্যাচ</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="যেমন: 19"
                      value={profileData.batch}
                      onChange={(e) => setProfileData({ ...profileData, batch: e.target.value })}
                    />
                  </div>
                </div>

                <div className="card-footer">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <FiSave /> {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="card profile-form">
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">বর্তমান পাসওয়ার্ড</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">নতুন পাসওয়ার্ড</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="card-footer">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <FiLock /> {saving ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
