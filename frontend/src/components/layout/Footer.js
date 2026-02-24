import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand">
              <span className="brand-icon">🎯</span>
              <span className="brand-text">দাবি.com</span>
            </div>
            <p className="footer-desc">
              SUST এর ছাত্র-ছাত্রীদের জন্য দাবি ও অভিযোগ জমা দেওয়ার প্ল্যাটফর্ম। 
              আপনার কণ্ঠস্বর আমাদের কাছে গুরুত্বপূর্ণ।
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><FiFacebook /></a>
              <a href="#" className="social-link"><FiTwitter /></a>
              <a href="#" className="social-link"><FiInstagram /></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>দ্রুত লিংক</h4>
            <Link to="/demands">সকল দাবি</Link>
            <Link to="/public">সমাধান হয়েছে</Link>
            <Link to="/create-demand">দাবি জমা দিন</Link>
            <Link to="/register">রেজিস্টার করুন</Link>
          </div>

          <div className="footer-links">
            <h4>সাহায্য</h4>
            <Link to="/faq">সাধারণ প্রশ্ন</Link>
            <Link to="/guidelines">গাইডলাইন</Link>
            <Link to="/privacy">প্রাইভেসি পলিসি</Link>
            <Link to="/terms">শর্তাবলী</Link>
          </div>

          <div className="footer-contact">
            <h4>যোগাযোগ</h4>
            <div className="contact-item">
              <FiMapPin />
              <span>শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়, সিলেট</span>
            </div>
            <div className="contact-item">
              <FiMail />
              <span>support@daabi.com</span>
            </div>
            <div className="contact-item">
              <FiPhone />
              <span>০১৭XX-XXXXXX</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} দাবি.com - সর্বস্বত্ব সংরক্ষিত</p>
          <p>Made with ❤️ for SUST Students</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
