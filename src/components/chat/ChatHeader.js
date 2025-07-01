import React from 'react';
import SparkIcon from '../SparkIcon';

const ChatHeader = ({ hasInteracted, onReset, onClose, freezeOnThinking, onToggleFreeze }) => {
  return (
    <header className="chat-header">
      <div className={`header-title ${!hasInteracted ? 'hidden' : ''}`}>
        <h1>Sara</h1>
      </div>
      <div className="header-actions">
        {/* TEMP: Freeze toggle for styling */}
        <button 
          onClick={onToggleFreeze}
          className={`freeze-button ${freezeOnThinking ? 'active' : ''}`}
          title={`${freezeOnThinking ? 'Disable' : 'Enable'} freeze on thinking`}
          style={{ 
            background: freezeOnThinking ? '#ff6b6b' : 'transparent',
            color: freezeOnThinking ? 'white' : '#666',
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '12px',
            border: '1px solid #ddd'
          }}
        >
          {freezeOnThinking ? '❄️' : '▶️'}
        </button>
        
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