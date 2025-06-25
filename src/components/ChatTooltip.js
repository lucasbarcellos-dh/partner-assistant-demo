import React from 'react';
import './ChatTooltip.scss';

const ChatTooltip = ({ isVisible, onClose, onOpenChat }) => {

  const handleTryItOut = () => {
    onOpenChat();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Tooltip content */}
      <div className={`chat-tooltip ${isVisible ? 'visible' : ''}`}>
        <div className="chat-tooltip__arrow" />
        <div className="chat-tooltip__content">
          <h4 className="chat-tooltip__title">
            <span className="new-badge">New!</span> Meet Sara, your AI assistant
          </h4>
          <p className="chat-tooltip__description">
            Ask Sara questions about your business. By analyzing your data, Sara will provide insights and recommendations and help you grow your business.
          </p>
          <div className="chat-tooltip__actions">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                className="dont-show-checkbox"
              />
              <span className="checkbox-text">Don't show this again</span>
            </label>
            <button className="btn btn--primary" onClick={handleTryItOut}>
              Try it out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatTooltip; 