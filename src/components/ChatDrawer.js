// src/components/ChatDrawer.js
import React, { useState, useRef, useEffect } from 'react';
import './ChatDrawer.scss';
import SparkIcon from './SparkIcon'; // Import the SparkIcon component

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
            {formatBoldText(line)}
          </div>
        );
      } else {
        // Regular paragraph
        return <p key={i} className="paragraph">{formatBoldText(line)}</p>;
      }
    });
  };
  
  // Function to handle bold text formatting (text wrapped in ** or __)
  const formatBoldText = (text) => {
    if (!text) return null;
    
    // Regular expression to match text between ** or __ markers
    const boldRegex = /(\*\*|__)(.*?)\1/g;
    
    // Split text by bold markers
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add bold text
      parts.push(<strong key={match.index}>{match[2]}</strong>);
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="formatted-content">
      {formatText(content)}
    </div>
  );
};

// Question Chips Component
const QuestionChips = ({ onSelectQuestion, isLoading }) => {
  // Sample suggested questions - extended list for grid layout
  const suggestedQuestions = [
    "How did last week go?",
    "Is it worth investing in ads?",
    "What do people order most on weekends?",
    "How are my recent reviews?",
  ];

  return (
    <div className="question-chips-container">
      <div className="chips-subtitle">Some things you can ask:</div>
      <div className="question-chips">
        {suggestedQuestions.map((question, index) => (
          <button 
            key={index} 
            className="question-chip"
            onClick={() => onSelectQuestion(question)}
            disabled={isLoading}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

const ChatDrawer = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { sender: 'assistant', content: 'Hi there! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); // Reference to the input field
  
  const backendURL = "https://8e3f7f7953d7.ngrok.app";

  // Handle initial transition when the drawer opens
  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure the drawer animation has started
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // Matches the drawer transition time
    }
  }, [isOpen]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle transitions between states
  useEffect(() => {
    if (hasInteracted) {
      // When transitioning to interacted state, ensure smooth header transition
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [hasInteracted]);

  // Handle selection of a suggested question and auto-submit
  const handleSelectQuestion = (question) => {
    // Set the input first
    setInput(question);
    
    // Then trigger the send process with the selected question
    // We need to use setTimeout to ensure the input state is updated before sending
    setTimeout(() => {
      // Create a copy of the question for the API call
      const selectedQuestion = question;
      
      // Mark as interacted on first user message
      if (!hasInteracted) {
        setHasInteracted(true);
      }
      
      // Add user message to chat
      const userMessage = { sender: 'user', content: selectedQuestion };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      setIsLoading(true);
      
      // Call your backend API
      callAssistantAPI(selectedQuestion)
        .then(response => {
          // Add assistant response to chat
          const assistantMessage = { sender: 'assistant', content: response };
          setMessages(prevMessages => [...prevMessages, assistantMessage]);
        })
        .catch(error => {
          console.error('Error calling assistant API:', error);
          // Handle error - show message to user
          setMessages(prevMessages => [
            ...prevMessages, 
            { sender: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
          ]);
        })
        .finally(() => {
          setIsLoading(false);
          // Re-focus the input after sending
          inputRef.current?.focus();
        });
    }, 0);
  };

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    // Mark as interacted on first user message
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    
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
      
      // Reset the UI and interaction state
      setMessages([
        { sender: 'assistant', content: 'Hi there! How can I help you today?' }
      ]);
      setHasInteracted(false);
      
      // Focus the input field after reset
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error resetting conversation:', error);
    }
  };

  // Determine container class based on interaction state
  const chatContainerClass = hasInteracted 
    ? "chat-container bottom-input" 
    : "chat-container centered-input";

  // Determine drawer class based on open state and interaction state
  const drawerClass = `chat-drawer ${isOpen ? 'open' : ''} ${!hasInteracted ? 'initial-state' : ''}`;

  return (
    <div className={drawerClass}>
      <header className="chat-header">
        {/* Only show title and reset button after interaction */}
        <div className={`header-title ${!hasInteracted ? 'hidden' : ''}`}>
          <SparkIcon width={24} height={24} />
          <h1>Chefie</h1>
        </div>
        <div className="header-actions">
          {/* New conversation button - only visible after interaction */}
          <button 
            onClick={handleReset} 
            className={`reset-button ${!hasInteracted ? 'hidden' : ''}`} 
            title="Start a new conversation"
          >
            <span className="material-symbols-rounded">refresh</span>
          </button>
          
          {/* Close button - always visible */}
          <button onClick={onClose} className="close-button" title="Close chat">
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>
      </header>
      
      <div className={chatContainerClass}>
        <div className="messages-container">
          {hasInteracted && messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              <div className="message-content">
                <FormattedMessageContent content={message.content} />
              </div>
            </div>
          ))}
          
          {/* Only show typing indicator when loading and has interacted */}
          {isLoading && hasInteracted && (
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
          {!hasInteracted && (
            <>
              <div className="centered-icon">
                <SparkIcon width={64} height={64} />
              </div>
              <h1 className="centered-title">What can I help with?</h1>
              <div className="welcome-text">
                You can ask me about your business operations, performance, customer reviews, advertising and more.
              </div>
            </>
          )}
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask something about your store..."
              disabled={isLoading}
              ref={inputRef}
            />
            <button onClick={handleSend} disabled={isLoading} className="send-button">
              {isLoading ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <span className="material-symbols-rounded">arrow_upward</span>
              )}
            </button>
          </div>
          
          {/* Only show Question Chips in initial state */}
          {!hasInteracted && (
            <QuestionChips 
              onSelectQuestion={handleSelectQuestion}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDrawer;