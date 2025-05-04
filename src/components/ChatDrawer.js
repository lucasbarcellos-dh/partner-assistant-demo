import React, { useState, useRef, useEffect } from 'react';
import './ChatDrawer.scss';
import SparkIcon from './SparkIcon'; // Import the SparkIcon component

// Handle formatted message content
const FormattedMessageContent = ({ content }) => {
  // Function to convert plain text with Markdown-like syntax to proper HTML formatting
  const formatText = (text) => {
    if (!text) return null;
    
    // Split by newlines
    return text.split('\n').map((line, i) => {
      // Check for headings (lines starting with #, ##, ###)
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length; // Number of # symbols
        const headingContent = formatBoldText(headingMatch[2]);
        
        // Return appropriate heading based on level
        return (
          <div key={i} className={`markdown-heading markdown-h${level}`}>
            {headingContent}
          </div>
        );
      }
      
      // Modify this section to handle list items better
      // Only check for bullet points, remove the dash handling
      const isBulletListItem = /^\s*[•]\s+/.test(line);
      
      if (line.trim() === '') {
        // Empty line - reduce spacing between sections
        // Don't add <br> for empty lines that follow headers or are at start
        const isPrevHeading = i > 0 && text.split('\n')[i-1].match(/^(#{1,6})\s+(.+)$/);
        return isPrevHeading ? null : <div key={i} style={{ height: '8px' }}></div>;
      } else if (isBulletListItem) {
        // List item - use consistent bullet styling
        return (
          <div key={i} className="list-item">
            {formatBoldText(line)}
          </div>
        );
      } else {
        // Regular paragraph
        return <p key={i} className="paragraph">{formatBoldText(line)}</p>;
      }
    }).filter(Boolean); // Remove nulls from the output
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
  // Remove initial welcome message
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null); // Reference to the textarea field
  
  const apiURL = "https://partner-assistant-demo-api.onrender.com"

  // Handle initial transition when the drawer opens
  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure the drawer animation has started
      setTimeout(() => {
        textareaRef.current?.focus();
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

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Function to adjust height based on content
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    };
    
    // Initial adjustment
    adjustHeight();
    
    // Add event listener for input changes
    textarea.addEventListener('input', adjustHeight);
    
    // Cleanup
    return () => {
      textarea.removeEventListener('input', adjustHeight);
    };
  }, [input]);

  // Handle streamed response from the server
  const handleStreamedResponse = async (userInput) => {
    try {
      // Mark as interacted on first user message
      if (!hasInteracted) {
        setHasInteracted(true);
      }
      
      // Add user message to chat
      const userMessage = { sender: 'user', content: userInput };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      setIsLoading(true);
      
      // Remove any existing typing indicators first
      setMessages(prevMessages => prevMessages.filter(msg => !msg.isTypingIndicator));
      
      // Add typing indicator
      const typingIndicatorId = Date.now() + '-typing';
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          sender: 'assistant', 
          isTypingIndicator: true, 
          id: typingIndicatorId 
        }
      ]);
      
      // Set up event source for streaming
      const eventSource = new EventSource(`${apiURL}/api/assistant?userId=user-123&message=${encodeURIComponent(userInput)}`);
      
      let fullResponse = '';
      let assistantMessageId = null;
      
      // Handle streaming chunks
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.error) {
          console.error('Error from server:', data.error);
          eventSource.close();
          
          // Remove typing indicator
          setMessages(prevMessages => prevMessages.filter(msg => msg.id !== typingIndicatorId));
          
          setIsLoading(false);
          return;
        }
        
        if (data.done) {
          // Stream complete - remove typing indicator
          setMessages(prevMessages => prevMessages.filter(msg => msg.id !== typingIndicatorId));
          
          // If we never received any content, add an error message
          if (!assistantMessageId) {
            setMessages(prevMessages => [
              ...prevMessages,
              { 
                sender: 'assistant', 
                content: 'Sorry, I encountered an error. Please try again.',
                id: Date.now()
              }
            ]);
          }
          
          eventSource.close();
          setIsLoading(false);
          return;
        }
        
        if (data.chunk) {
          // On first chunk, create the actual message
          if (!assistantMessageId) {
            assistantMessageId = Date.now();
            fullResponse = data.chunk;
            
            // Add the assistant message
            setMessages(prevMessages => [
              ...prevMessages.filter(msg => msg.id !== typingIndicatorId), // Remove typing indicator
              { 
                sender: 'assistant', 
                content: data.chunk,
                id: assistantMessageId
              },
              // Re-add typing indicator at the end
              { 
                sender: 'assistant', 
                isTypingIndicator: true, 
                id: typingIndicatorId 
              }
            ]);
          } else {
            // Append the new chunk to the full response
            fullResponse += data.chunk;
            
            // Update the assistant message with the accumulated response
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: fullResponse } 
                  : msg
              )
            );
          }
        }
      };
      
      // Handle errors
      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        
        // Remove typing indicator
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== typingIndicatorId));
        
        setIsLoading(false);
        
        // If we haven't received any content yet, show an error message
        if (!assistantMessageId) {
          setMessages(prevMessages => [
            ...prevMessages,
            { 
              sender: 'assistant', 
              content: 'Sorry, I encountered an error. Please try again.',
              id: Date.now()
            }
          ]);
        }
      };
      
    } catch (error) {
      console.error('Error setting up streaming:', error);
      setIsLoading(false);
    }
  };

  // Handle selection of a suggested question and auto-submit
  const handleSelectQuestion = (question) => {
    // Set the input first
    setInput(question);
    
    // Then trigger the send process with the selected question
    setTimeout(() => {
      // Create a copy of the question for the API call
      const selectedQuestion = question;
      
      // Use the streaming response handler
      handleStreamedResponse(selectedQuestion);
      
      // Re-focus the textarea after sending
      textareaRef.current?.focus();
    }, 0);
  };

  // Handle sending a message
  const handleSend = async () => {
    if (input.trim() === '') return;
    
    // Use the streaming response handler
    await handleStreamedResponse(input);
    
    // Re-focus the textarea after sending
    textareaRef.current?.focus();
  };

  // Reset conversation
  const handleReset = async () => {
    try {
      // Reset the conversation history on the server
      const response = await fetch(apiURL + '/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: 'user-123' // Optional: Add user identification for thread management
        })
      });
      
      if (!response.ok) {
        throw new Error('Reset request failed');
      }
      
      // Reset the UI and interaction state
      setMessages([]);
      setHasInteracted(false);
      
      // Focus the textarea field after reset
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Error resetting conversation:', error);
    }
  };

  // Handle key down event for textarea
  const handleKeyDown = (e) => {
    // If Enter is pressed without Shift, send the message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid new line
      handleSend();
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
          {hasInteracted && messages.map((message, index) => {
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
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something about your business…"
              disabled={isLoading}
              rows="1"
              className="chat-textarea"
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