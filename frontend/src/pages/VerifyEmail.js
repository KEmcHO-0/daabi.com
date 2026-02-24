import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import './Auth.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
      } catch (error) {
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-message">
            {status === 'loading' && (
              <>
                <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
                <h2>ইমেইল ভেরিফাই হচ্ছে...</h2>
                <p>অপেক্ষা করুন</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="icon">✅</div>
                <h2>ইমেইল ভেরিফাই হয়েছে!</h2>
                <p>আপনার ইমেইল সফলভাবে ভেরিফাই হয়েছে।</p>
                <Link to="/dashboard" className="btn btn-primary">
                  ড্যাশবোর্ডে যান
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="icon">❌</div>
                <h2>ভেরিফিকেশন ব্যর্থ!</h2>
                <p>লিংকটি অবৈধ বা মেয়াদোত্তীর্ণ হয়ে গেছে।</p>
                <Link to="/login" className="btn btn-primary">
                  লগইন করুন
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
