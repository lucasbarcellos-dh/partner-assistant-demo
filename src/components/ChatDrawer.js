import React, { useState, useRef, useEffect } from 'react';
import './ChatDrawer.css';

// Handle formatted message content
const FormattedMessageContent = ({ content }) => {
  // Function to convert plain text with newlines to proper HTML formatting
  const formatText = (text) => {
    if (!text) return null;
    
    // Split by newlines
    return text.split('\n').map((line, i) => {
      // Check if this is a list item (starts with -, *, or numbers followed by .)
      const isListItem = /^\s*(?:[-*]|\d+\.)\s+/.test(line);
      
      if (line.trim() === '') {
        // Empty line - add a line break
        return <br key={i} />;
      } else if (isListItem) {
        // List item - add proper styling
        return (
          <div key={i} className="list-item">
            {line}
          </div>
        );
      } else {
        // Regular paragraph
        return <p key={i} className="paragraph">{line}</p>;
      }
    });
  };

  return (
    <div className="formatted-content">
      {formatText(content)}
    </div>
  );
};

const ChatDrawer = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { sender: 'assistant', content: 'Hi there! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); // Reference to the input field
  
  const backendURL = "https://8e3f7f7953d7.ngrok.app";

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Auto-focus input when drawer opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small timeout to ensure the drawer animation has started
      setTimeout(() => {
        inputRef.current.focus();
      }, 300); // Matches the drawer transition time
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    // Add user message to chat
    const userMessage = { sender: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Call your backend API here
      const response = await callAssistantAPI(input);
      
      // Add assistant response to chat
      const assistantMessage = { sender: 'assistant', content: response };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error calling assistant API:', error);
      // Handle error - show message to user
      setMessages(prevMessages => [
        ...prevMessages, 
        { sender: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
      // Re-focus the input after sending
      inputRef.current?.focus();
    }
  };

  // Call the backend API
  const callAssistantAPI = async (userInput) => {
    try {
      const response = await fetch(backendURL + '/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling API:', error);
      throw error;
    }
  };

  // Reset conversation
  const handleReset = async () => {
    try {
      // Reset the conversation history on the server
      const response = await fetch(backendURL + '/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Reset request failed');
      }
      
      // Reset the UI
      setMessages([
        { sender: 'assistant', content: 'Hi there! How can I help you today?' }
      ]);
      
      // Focus the input field after reset
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error resetting conversation:', error);
    }
  };

  return (
    <div className={`chat-drawer ${isOpen ? 'open' : ''}`}>
      <header className="chat-header">
        <h1>Assistant</h1>
        <div className="header-actions">
          {/* New conversation button */}
          <button onClick={handleReset} className="reset-button" title="Start a new conversation">
            <span className="material-symbols-rounded">refresh</span>
          </button>
          
          {/* Close button */}
          <button onClick={onClose} className="close-button" title="Close chat">
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>
      </header>
      
      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              <div className="message-content">
                <FormattedMessageContent content={message.content} />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-content typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask something about your store..."
            disabled={isLoading}
            ref={inputRef} // Add ref to the input element
          />
          <button onClick={handleSend} disabled={isLoading} className="send-button">
            {isLoading ? (
              <span className="sending-text">Sending...</span>
            ) : (
              <span className="material-symbols-rounded">send</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDrawer;