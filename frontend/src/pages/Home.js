import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiUsers, FiMessageCircle, FiTrendingUp, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    resolved: 0,
    total: 0,
    users: 0,
    satisfaction: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/demands/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const features = [
    {
      icon: <FiMessageCircle />,
      title: 'সহজে দাবি জমা দিন',
      description: 'কয়েকটি ক্লিকেই আপনার দাবি বা অভিযোগ জমা দিন'
    },
    {
      icon: <FiTrendingUp />,
      title: 'রিয়েল-টাইম ট্র্যাকিং',
      description: 'আপনার দাবির অবস্থা রিয়েল-টাইমে ট্র্যাক করুন'
    },
    {
      icon: <FiUsers />,
      title: 'কমিউনিটি সাপোর্ট',
      description: 'অন্য ছাত্রদের দাবিতে সমর্থন দিন'
    },
    {
      icon: <FiShield />,
      title: 'বেনামী অপশন',
      description: 'চাইলে বেনামে দাবি জমা দিতে পারবেন'
    }
  ];

  const statsData = [
    { number: stats.resolved.toString(), label: 'সমাধান হয়েছে' },
    { number: stats.total.toString(), label: 'মোট দাবি' },
    { number: stats.users.toString(), label: 'ব্যবহারকারী' },
    { number: `${stats.satisfaction}%`, label: 'সন্তুষ্টি' }
  ];

  const steps = [
    { step: '১', title: 'রেজিস্টার করুন', desc: 'আপনার SUST ইমেইল/আইডি দিয়ে রেজিস্টার করুন' },
    { step: '২', title: 'দাবি লিখুন', desc: 'আপনার দাবি বা অভিযোগের বিস্তারিত লিখুন' },
    { step: '৩', title: 'সাবমিট করুন', desc: 'দাবি সাবমিট করুন এবং ট্র্যাক করুন' },
    { step: '৪', title: 'সমাধান পান', desc: 'কমিটির রেসপন্স পান এবং সমাধান হোক' }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              আপনার <span className="gradient-text">কণ্ঠস্বর</span> গুরুত্বপূর্ণ
            </h1>
            <p className="hero-subtitle">
              SUST এর ছাত্র-ছাত্রীদের জন্য দাবি ও অভিযোগ জমা দেওয়ার প্ল্যাটফর্ম। 
              আপনার সমস্যাগুলো তুলে ধরুন, সমাধান পান।
            </p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <Link to="/create-demand" className="btn btn-primary btn-lg">
                  দাবি জমা দিন <FiArrowRight />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    শুরু করুন <FiArrowRight />
                  </Link>
                  <Link to="/demands" className="btn btn-secondary btn-lg">
                    দাবিগুলো দেখুন
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-card card">
              <div className="card-mock-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="card-mock-content">
                <div className="mock-badge">✅ সমাধান হয়েছে</div>
                <h3>লাইব্রেরিতে আসন বাড়ানোর দাবি</h3>
                <p>পরীক্ষার সময় লাইব্রেরিতে বসার জায়গা না পাওয়া যায়...</p>
                <div className="mock-footer">
                  <span>👍 ২৫৬ সমর্থন</span>
                  <span>💬 ৪৫ মন্তব্য</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {statsData.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>কেন দাবি.com ব্যবহার করবেন?</h2>
            <p>সহজ, স্বচ্ছ এবং কার্যকর একটি প্ল্যাটফর্ম</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <h2>কিভাবে কাজ করে?</h2>
            <p>মাত্র ৪টি সহজ ধাপে আপনার দাবি জমা দিন</p>
          </div>
          <div className="steps-grid">
            {steps.map((item, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                {index < steps.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>আজই শুরু করুন!</h2>
            <p>আপনার দাবি জানাতে এবং পরিবর্তন আনতে এখনই যোগ দিন</p>
            <div className="cta-buttons">
              {isAuthenticated ? (
                <Link to="/create-demand" className="btn btn-primary btn-lg">
                  দাবি জমা দিন <FiArrowRight />
                </Link>
              ) : (
                <Link to="/register" className="btn btn-primary btn-lg">
                  ফ্রি রেজিস্টার করুন <FiArrowRight />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
