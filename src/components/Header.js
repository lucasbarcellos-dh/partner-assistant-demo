// src/components/Header.js
import React from 'react';
import './Header.scss';
import SparkIcon from './SparkIcon';

const Header = ({ openChat }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="page-title">
          Plugin name
        </div>
        
        <div className="header-actions">
        <div className="status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">Open</span>
          </div>
          <button className="action-button notification-button">
            <span className="material-symbols-rounded">notifications</span>
          </button>
          
          <button 
            className="action-button chat-toggle-button"
            onClick={openChat}
            aria-label="Open chat assistant"
          >
            <SparkIcon width={24} height={24} />
          </button>
          
          <div className="user-profile">
            <div className="user-avatar">
            <span className="material-symbols-rounded">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;