import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer(){
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="footer-section">
            <div className="footer-brand">
              <h3>MarketOS</h3>
              <p>Your one-stop marketplace for everything you need.</p>
            </div>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/search">Search</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/local-stores">Local Stores</Link></li>
              <li><Link to="/deals">Deals</Link></li>
            </ul>
          </div>

          <div>
            <h4>Customer Service</h4>
            <ul>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/returns">Returns & Refunds</Link></li>
              <li><Link to="/shipping">Shipping Info</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4>Your Account</h4>
            <ul>
              <li><Link to="/profile">My Profile</Link></li>
              <li><Link to="/orders">Order History</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/settings">Settings</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container">
          <p>© {new Date().getFullYear()} MarketOS. All rights reserved. Built for AWS Hackathon 2025.</p>
        </div>
      </div>
    </footer>
  );
}

