// src/components/Sidebar.js
import React from 'react';
import './Sidebar.scss';
import DHLogo from './DHLogo';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo-container">
        <div className="logo">
        <DHLogo fill="var(--primary-color)" />
        </div>
      </div>
      
      <div className="nav-section">
        <div className="nav-section-title">Stay on top</div>
        <ul className="nav-list">
          <li className="nav-item">
            <a href="#" className="nav-link active">
              <span className="nav-icon">
                <span className="material-symbols-rounded">shopping_bag</span>
              </span>
              <span className="nav-text">Live orders</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <span className="material-symbols-rounded">dashboard</span>
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
                <span className="material-symbols-rounded">insert_chart</span>
              </span>
              <span className="nav-text">Reports</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <span className="material-symbols-rounded">history</span>
              </span>
              <span className="nav-text">Order history</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <span className="material-symbols-rounded">favorite</span>
              </span>
              <span className="nav-text">Reviews</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <span className="material-symbols-rounded">trophy</span>
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
                <span className="material-symbols-rounded">trending_up</span>
              </span>
              <span className="nav-text">Smart Marketer</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <span className="material-symbols-rounded">ads_click</span>
              </span>
              <span className="nav-text">Advertising</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <span className="material-symbols-rounded">local_offer</span>
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
                <span className="material-symbols-rounded">book_5</span>
              </span>
              <span className="nav-text">Menu</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <span className="material-symbols-rounded">schedule</span>
              </span>
              <span className="nav-text">Opening times</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <span className="material-symbols-rounded">account_balance</span>
              </span>
              <span className="nav-text">Finances</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <span className="material-symbols-rounded">school</span>
              </span>
              <span className="nav-text">University</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">
                <span className="material-symbols-rounded">settings</span>
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