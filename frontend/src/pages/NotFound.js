import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div>
        <div style={{ fontSize: '8rem', marginBottom: '20px' }}>🔍</div>
        <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>৪০৪</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--gray)' }}>
          পৃষ্ঠা পাওয়া যায়নি
        </h2>
        <p style={{ color: 'var(--gray)', marginBottom: '30px' }}>
          আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি বিদ্যমান নেই বা মুছে ফেলা হয়েছে।
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            <FiHome /> হোম পেজে যান
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-outline">
            <FiArrowLeft /> পেছনে যান
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
