import React from 'react';
import FormattedMessageContent from './FormattedMessageContent';

const MessageList = ({ messages, messagesEndRef }) => {
  return (
    <div className="messages-container">
      {messages.map((message, index) => {
        // Special case for typing indicator
        if (message.isTypingIndicator) {
          return (
            <div key={message.id} className="message assistant typing-indicator">
              <div className="message-content">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          );
        }
        
        // Regular message
        return (
          <div key={message.id || index} className={`message ${message.sender}`}>
            <div className="message-content">
              <FormattedMessageContent content={message.content} />
            </div>
          </div>
        );
      })}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;