import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="brand-logo-sm">SC</div>
            <span>Sourashtra Community Portal</span>
          </div>
          <p>Connecting and empowering the Sourashtra community through digital innovation and community service.</p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/membership">Membership</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Services</h4>
          <ul>
            <li><Link to="/business">Business Directory</Link></li>
            <li><Link to="/jobs">Jobs Portal</Link></li>
            <li><Link to="/scholarship">Scholarships</Link></li>
            <li><Link to="/forum">Community Forum</Link></li>
            <li><Link to="/donate">Donations</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p>Email: info@sourashtra.org</p>
          <p>Phone: +91 98765 43210</p>
          <p>Address: Chennai, Tamil Nadu, India</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Sourashtra Community Portal. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
