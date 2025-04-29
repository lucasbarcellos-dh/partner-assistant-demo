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

const ChatDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'assistant', content: 'Hi there! I\'m your restaurant assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const backendURL = "https://8e3f7f7953d7.ngrok.app";

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

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
        { sender: 'assistant', content: 'Hi there! I\'m your restaurant assistant. How can I help you today?' }
      ]);
    } catch (error) {
      console.error('Error resetting conversation:', error);
    }
  };

  return (
    <div className="chat-widget">
      {/* Chat toggle button */}
      <button 
        className={`chat-toggle-button ${isOpen ? 'open' : ''}`} 
        onClick={toggleDrawer}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <span className="material-symbols-rounded">close</span>
        ) : (
          <span className="material-symbols-rounded">chat</span>
        )}
      </button>
      
      {/* Chat drawer */}
      <div className={`chat-drawer ${isOpen ? 'open' : ''}`}>
        <header className="chat-header">
          <h1>Restaurant AI Assistant</h1>
          {/* <button onClick={handleReset} className="reset-button">
            New Conversation
          </button> */}
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
              placeholder="Ask something about your restaurant..."
              disabled={isLoading}
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
    </div>
  );
};

export default ChatDrawer;