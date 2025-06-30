import React from 'react';
import FormattedMessageContent from './FormattedMessageContent';
import SparkIcon from '../SparkIcon';

const MessageList = ({ messages, messagesEndRef }) => {
  return (
    <div className="messages-container">
      {messages.map((message, index) => {
        // Special case for typing indicator
        if (message.isTypingIndicator) {
          return (
            <div key={message.id} className="message assistant typing-indicator">
              <div className="message-content">
                <SparkIcon width={20} height={20} animation="pulse" />
                <span className="thinking-text">Thinking</span>
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