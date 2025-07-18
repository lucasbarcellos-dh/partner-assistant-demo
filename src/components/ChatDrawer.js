import React, { useState, useRef, useEffect } from 'react';
import './ChatDrawer.scss';
import SparkIcon from './SparkIcon';
import ChatHeader from './chat/ChatHeader';
import MessageList from './chat/MessageList';
import QuestionChips from './chat/QuestionChips';
import ChatInput from './chat/ChatInput';

const ChatDrawer = ({ isOpen, onClose, initialQuestion = '' }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [eventSource, setEventSource] = useState(null);
  const [initialQuestionProcessed, setInitialQuestionProcessed] = useState(false);
  
  const apiURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Reset chat and set hasInteracted to true when a quick question is provided
  useEffect(() => {
    if (isOpen && initialQuestion) {
      // Reset messages when a new quick question comes in
      setMessages([]);
      setHasInteracted(true);
      
      // Also reset conversation with the server
      (async () => {
        try {
          await fetch(`${apiURL}/api/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user-123' })
          });
        } catch (error) {
          console.error('Error resetting conversation:', error);
        }
      })();
    }
  }, [isOpen, initialQuestion, apiURL]);

  // Handle initial question when drawer opens
  useEffect(() => {
    if (isOpen && initialQuestion && !initialQuestionProcessed) {
      // Set a small delay to ensure the drawer is visible first
      const timer = setTimeout(() => {
        handleStreamedResponse(initialQuestion);
        setInitialQuestionProcessed(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    // Reset flag when drawer closes
    if (!isOpen && initialQuestionProcessed) {
      setInitialQuestionProcessed(false);
    }
  }, [isOpen, initialQuestion, initialQuestionProcessed]);
  
  // Focus textarea when drawer opens
  useEffect(() => {
    if (isOpen && !initialQuestion) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    }
  }, [isOpen, initialQuestion]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Cleanup event source on unmount
  useEffect(() => {
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [eventSource]);

  // Helper to remove typing indicators
  const removeTypingIndicators = (msgs) =>
    msgs.filter(msg => !msg.isTypingIndicator);

  // Stop streaming response
  const stopStreaming = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setIsLoading(false);
      setMessages(prevMessages => removeTypingIndicators(prevMessages));
    }
  };

  // Handle streamed response from server
  const handleStreamedResponse = async (userInput) => {
    try {
      // Mark as interacted on first user message
      if (!hasInteracted) {
        setHasInteracted(true);
      }
      
      // Add user message to chat
      const userMessage = { sender: 'user', content: userInput, id: Date.now() };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      setIsLoading(true);
      
      // Stop existing stream if any
      if (eventSource) {
        eventSource.close();
      }
      
      // Remove existing typing indicators
      setMessages(prevMessages => removeTypingIndicators(prevMessages));
      
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
      const newEventSource = new EventSource(
        `${apiURL}/api/assistant?userId=user-123&message=${encodeURIComponent(userInput)}`
      );
      setEventSource(newEventSource);
      
      // Handle streaming chunks
      newEventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.init) return;
        
        if (data.done) {
          newEventSource.close();
          setEventSource(null);
          setIsLoading(false);
          return;
        }
        
        if (data.error) {
          console.error('Error from server:', data.error);
          newEventSource.close();
          setEventSource(null);
          setIsLoading(false);
          setMessages(prevMessages => [
            ...prevMessages.filter(msg => !msg.isTypingIndicator),
            {
              sender: 'assistant',
              content: `Error: ${data.error}`,
              id: Date.now()
            }
          ]);
          return;
        }

        if (data.chunk) {
          setMessages(prevMessages => {
            // Remove typing indicator
            const filtered = prevMessages.filter(msg => !msg.isTypingIndicator);

            // Check if the last message is an assistant message from this turn
            const lastMsg = filtered[filtered.length - 1];
            if (!lastMsg || lastMsg.sender !== 'assistant' || lastMsg.isTypingIndicator) {
              // Create a new assistant message for this turn
              return [
                ...filtered,
                {
                  sender: 'assistant',
                  content: data.chunk,
                  id: Date.now()
                }
              ];
            } else {
              // Append to the current assistant message
              return filtered.map((msg, idx) =>
                idx === filtered.length - 1
                  ? { ...msg, content: msg.content + data.chunk }
                  : msg
              );
            }
          });
        }
      };
      
      // Handle errors
      newEventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        newEventSource.close();
        setEventSource(null);
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== typingIndicatorId));
        setIsLoading(false);
        
        setMessages(prevMessages => [
          ...prevMessages,
          { 
            sender: 'assistant', 
            content: 'Sorry, I encountered a connection error. Please try again.',
            id: Date.now()
          }
        ]);
      };
      
    } catch (error) {
      console.error('Error setting up streaming:', error);
      setIsLoading(false);
      setEventSource(null);
      
      // Add error message
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          sender: 'assistant', 
          content: 'Sorry, something went wrong. Please try again.',
          id: Date.now()
        }
      ]);
    }
  };

  // Handle selection of suggested question
  const handleSelectQuestion = (question) => {
    setInput(question);
    setTimeout(() => {
      handleStreamedResponse(question);
      textareaRef.current?.focus();
    }, 0);
  };

  // Handle sending a message
  const handleSend = async () => {
    if (isLoading) {
      stopStreaming();
      return;
    }
    
    if (input.trim() === '') return;
    await handleStreamedResponse(input);
    textareaRef.current?.focus();
  };

  // Reset conversation
  const handleReset = async () => {
    try {
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }
      
      const response = await fetch(`${apiURL}/api/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 'user-123' })
      });
      
      if (!response.ok) {
        throw new Error('Reset request failed');
      }
      
      setMessages([]);
      setHasInteracted(false);
      setIsLoading(false);
      textareaRef.current?.focus();
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
      <ChatHeader 
        hasInteracted={hasInteracted}
        onReset={handleReset}
        onClose={onClose}
      />
      
      <div className={chatContainerClass}>
        {hasInteracted && (
          <MessageList 
            messages={messages} 
            messagesEndRef={messagesEndRef}
          />
        )}
        
        <div className="input-container">
          {!hasInteracted && (
            <div className="welcome-section">
              <div className="centered-icon">
                <SparkIcon width={64} height={64} animation="magical" />
              </div>
              <h1 className="centered-title">What can I help with?</h1>
              {/* <div className="welcome-text">
                You can ask me about your business operations, performance, customer reviews, advertising and more.
              </div> */}
            </div>
          )}
          
          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSend={handleSend}
            textareaRef={textareaRef}
          />
          
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