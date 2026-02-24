import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiSave, FiSend } from 'react-icons/fi';
import api from '../utils/api';
import { categories, priorities } from '../utils/constants';
import toast from 'react-hot-toast';
import './CreateDemand.css';

const CreateDemand = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    isAnonymous: false,
    tags: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (files.length + newFiles.length > 5) {
      toast.error('সর্বোচ্চ ৫টি ফাইল আপলোড করা যাবে');
      return;
    }
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category) {
      toast.error('সব প্রয়োজনীয় ফিল্ড পূরণ করুন');
      return;
    }

    isDraft ? setSaving(true) : setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      data.append('isAnonymous', formData.isAnonymous);
      data.append('tags', formData.tags);
      if (isDraft) data.append('status', 'draft');

      files.forEach(file => {
        data.append('attachments', file);
      });

      await api.post('/demands', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(isDraft ? 'খসড়া হিসেবে সংরক্ষিত!' : 'দাবি সফলভাবে সাবমিট হয়েছে!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'সমস্যা হয়েছে');
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  return (
    <div className="create-demand-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">নতুন দাবি জমা দিন</h1>
          <p className="page-subtitle">আপনার দাবি বা অভিযোগ বিস্তারিতভাবে লিখুন</p>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="demand-form card">
          <div className="card-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">শিরোনাম *</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="দাবির শিরোনাম লিখুন"
                value={formData.title}
                onChange={handleChange}
                maxLength={200}
                required
              />
              <small className="form-hint">{formData.title.length}/200</small>
            </div>

            {/* Category & Priority */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">ক্যাটাগরি *</label>
                <select
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">প্রায়োরিটি</label>
                <select
                  name="priority"
                  className="form-control"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  {priorities.map((pri) => (
                    <option key={pri.value} value={pri.value}>
                      {pri.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">বিস্তারিত বিবরণ *</label>
              <textarea
                name="description"
                className="form-control"
                placeholder="আপনার দাবি বা অভিযোগ বিস্তারিতভাবে লিখুন। যত বেশি তথ্য দিবেন, তত দ্রুত সমাধান হবে।"
                value={formData.description}
                onChange={handleChange}
                rows={8}
                maxLength={5000}
                required
              />
              <small className="form-hint">{formData.description.length}/5000</small>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">ট্যাগ</label>
              <input
                type="text"
                name="tags"
                className="form-control"
                placeholder="কমা দিয়ে ট্যাগ আলাদা করুন (যেমন: লাইব্রেরি, আসন, পরীক্ষা)"
                value={formData.tags}
                onChange={handleChange}
              />
              <small className="form-hint">সার্চে সাহায্য করবে</small>
            </div>

            {/* File Upload */}
            <div className="form-group">
              <label className="form-label">ফাইল সংযুক্ত করুন</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="file-input"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  hidden
                />
                <label htmlFor="file-input" className="file-upload-label">
                  <FiUpload />
                  <span>ছবি বা ডকুমেন্ট আপলোড করুন</span>
                  <small>JPEG, PNG, PDF, DOC (সর্বোচ্চ ১০MB, ৫টি ফাইল)</small>
                </label>
              </div>
              
              {files.length > 0 && (
                <div className="file-list">
                  {files.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name">{file.name}</span>
                      <button
                        type="button"
                        className="file-remove"
                        onClick={() => removeFile(index)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Anonymous */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                <span>বেনামে সাবমিট করুন</span>
              </label>
              <small className="form-hint">
                আপনার পরিচয় গোপন থাকবে, কিন্তু কমিটি আপনাকে চিনতে পারবে
              </small>
            </div>
          </div>

          <div className="card-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={(e) => handleSubmit(e, true)}
              disabled={saving || loading}
            >
              <FiSave /> {saving ? 'সংরক্ষণ হচ্ছে...' : 'খসড়া সংরক্ষণ'}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || saving}
            >
              <FiSend /> {loading ? 'সাবমিট হচ্ছে...' : 'সাবমিট করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDemand;
