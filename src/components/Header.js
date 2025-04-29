import React from 'react';
import './Header.css';

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
          <span className="material-symbols-rounded">chat</span>
        </button>
      </div>
    </header>
  );
};

export default Header;