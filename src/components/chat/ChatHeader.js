import React from 'react';
import SparkIcon from '../SparkIcon';

const ChatHeader = ({ hasInteracted, onReset, onClose }) => {
  return (
    <header className="chat-header">
      <div className={`header-title ${!hasInteracted ? 'hidden' : ''}`}>
        <h1>Sara</h1>
      </div>
      <div className="header-actions">
        <button 
          onClick={onReset} 
          className={`reset-button ${!hasInteracted ? 'hidden' : ''}`} 
          title="Start a new conversation"
        >
          <span className="material-symbols-rounded">refresh</span>
        </button>
        
        <button onClick={onClose} className="close-button" title="Close chat">
          <span className="material-symbols-rounded">close</span>
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;