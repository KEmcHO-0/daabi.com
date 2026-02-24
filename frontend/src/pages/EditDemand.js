import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiSave, FiSend } from 'react-icons/fi';
import api from '../utils/api';
import { categories, priorities } from '../utils/constants';
import toast from 'react-hot-toast';
import './CreateDemand.css';

const EditDemand = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    isAnonymous: false,
    tags: ''
  });
  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDemand();
  }, [id]);

  const fetchDemand = async () => {
    try {
      const res = await api.get(`/demands/${id}`);
      const demand = res.data.demand;
      
      if (demand.status !== 'draft') {
        toast.error('শুধুমাত্র খসড়া দাবি এডিট করা যাবে');
        navigate('/dashboard');
        return;
      }

      setFormData({
        title: demand.title,
        description: demand.description,
        category: demand.category,
        priority: demand.priority,
        isAnonymous: demand.isAnonymous,
        tags: demand.tags?.join(', ') || ''
      });
      setExistingFiles(demand.attachments || []);
    } catch (error) {
      toast.error('দাবি লোড করতে সমস্যা হয়েছে');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalFiles = existingFiles.length + newFiles.length + files.length;
    if (totalFiles > 5) {
      toast.error('সর্বোচ্চ ৫টি ফাইল');
      return;
    }
    setNewFiles([...newFiles, ...files]);
  };

  const removeNewFile = (index) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      data.append('isAnonymous', formData.isAnonymous);
      data.append('tags', formData.tags);
      if (!isDraft) data.append('status', 'pending');

      newFiles.forEach(file => {
        data.append('attachments', file);
      });

      await api.put(`/demands/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(isDraft ? 'খসড়া আপডেট হয়েছে!' : 'দাবি সাবমিট হয়েছে!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="create-demand-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">দাবি এডিট করুন</h1>
          <p className="page-subtitle">আপনার খসড়া দাবি আপডেট করুন</p>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="demand-form card">
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">শিরোনাম *</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                maxLength={200}
                required
              />
            </div>

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

            <div className="form-group">
              <label className="form-label">বিস্তারিত বিবরণ *</label>
              <textarea
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                rows={8}
                maxLength={5000}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">ট্যাগ</label>
              <input
                type="text"
                name="tags"
                className="form-control"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">ফাইল সংযুক্ত করুন</label>
              
              {existingFiles.length > 0 && (
                <div className="file-list mb-4">
                  {existingFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name">{file.originalName}</span>
                    </div>
                  ))}
                </div>
              )}

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
                  <span>নতুন ফাইল যোগ করুন</span>
                </label>
              </div>
              
              {newFiles.length > 0 && (
                <div className="file-list">
                  {newFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name">{file.name}</span>
                      <button
                        type="button"
                        className="file-remove"
                        onClick={() => removeNewFile(index)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
            </div>
          </div>

          <div className="card-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={(e) => handleSubmit(e, true)}
              disabled={submitting}
            >
              <FiSave /> খসড়া আপডেট
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <FiSend /> {submitting ? 'সাবমিট হচ্ছে...' : 'সাবমিট করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDemand;
