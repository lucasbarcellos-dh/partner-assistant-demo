import React from 'react';
import './Header.scss';
import SparkIcon from './SparkIcon';

const Header = ({ openChat }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <h1 className="app-title">partner portal</h1>
        <button 
          className="chat-toggle-button"
          onClick={openChat}
          aria-label="Open chat"
        >
          <SparkIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;