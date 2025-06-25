// src/components/Header.js
import React from 'react';
import './Header.scss';
import SparkIcon from './SparkIcon';
import ChatTooltip from './ChatTooltip';

const Header = ({ openChat, showChatTooltip, onCloseChatTooltip }) => {
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
          
          <div className="chat-button-container">
            <button 
              id="chat-toggle-button"
              className={`action-button chat-toggle-button ${showChatTooltip ? 'highlighted' : ''}`}
              onClick={openChat}
              aria-label="Open chat assistant"
            >
              <SparkIcon width={30} height={30} animation="magical" />
            </button>
            
            <ChatTooltip 
              isVisible={showChatTooltip} 
              onClose={onCloseChatTooltip}
              onOpenChat={openChat}
            />
          </div>
          
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