import React, { useEffect } from 'react';

const ChatInput = ({ input, setInput, isLoading, onSend, textareaRef }) => {
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
  }, [input, textareaRef]);

  // Handle key down event for textarea
  const handleKeyDown = (e) => {
    // If Enter is pressed without Shift, send the message (only if not loading)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid new line
      if (!isLoading) {
        onSend();
      }
    }
  };

  return (
    <div className="input-wrapper">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask something about your business…"
        rows="1"
        className="chat-textarea"
      />
      <button 
        onClick={isLoading ? undefined : onSend} 
        className="send-button"
        disabled={isLoading}
      >
        <span className="material-symbols-rounded">arrow_upward</span>
      </button>
    </div>
  );
};

export default ChatInput;