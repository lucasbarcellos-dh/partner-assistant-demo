// src/components/Sidebar.js
import React from 'react';
import './Sidebar.scss';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo-container">
        <div className="logo">
          <span className="logo-text">panda</span>
          <span className="logo-partner">partner</span>
        </div>
      </div>
      
      <div className="nav-section">
        <div className="nav-section-title">Stay on top</div>
        <ul className="nav-list">
          <li className="nav-item">
            <a href="#" className="nav-link active">
              <span className="nav-icon">
                <i className="icon icon-bag"></i>
              </span>
              <span className="nav-text">Live orders</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <i className="icon icon-grid"></i>
              </span>
              <span className="nav-text">Overview</span>
            </a>
          </li>
        </ul>
      </div>
      
      <div className="nav-section">
        <div className="nav-section-title">Monitor your performance</div>
        <ul className="nav-list">
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <i className="icon icon-chart"></i>
              </span>
              <span className="nav-text">Reports</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <i className="icon icon-clock"></i>
              </span>
              <span className="nav-text">Order history</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <i className="icon icon-star"></i>
              </span>
              <span className="nav-text">Reviews</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <i className="icon icon-trophy"></i>
              </span>
              <span className="nav-text">Rewards</span>
            </a>
          </li>
        </ul>
      </div>
      
      <div className="nav-section">
        <div className="nav-section-title">Grow your business</div>
        <ul className="nav-list">
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <i className="icon icon-chart-up"></i>
              </span>
              <span className="nav-text">Smart Marketer</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <i className="icon icon-megaphone"></i>
              </span>
              <span className="nav-text">Advertising</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <i className="icon icon-tag"></i>
              </span>
              <span className="nav-text">Promotions</span>
            </a>
          </li>
        </ul>
      </div>
      
      <div className="nav-section">
        <div className="nav-section-title">Manage your business</div>
        <ul className="nav-list">
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <i className="icon icon-menu"></i>
              </span>
              <span className="nav-text">Menu</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <i className="icon icon-clock-outline"></i>
              </span>
              <span className="nav-text">Opening times</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <i className="icon icon-wallet"></i>
              </span>
              <span className="nav-text">Finances</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <i className="icon icon-graduation-cap"></i>
              </span>
              <span className="nav-text">University</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <i className="icon icon-settings"></i>
              </span>
              <span className="nav-text">Settings</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;