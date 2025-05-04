import React from 'react';

const FormattedMessageContent = ({ content }) => {
  // Convert plain text with Markdown-like syntax to proper HTML formatting
  const formatText = (text) => {
    if (!text) return null;
    
    // Split by newlines
    return text.split('\n').map((line, i) => {
      // Check for headings (lines starting with #, ##, ###)
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length; // Number of # symbols
        const headingContent = formatBoldText(headingMatch[2]);
        
        return (
          <div key={i} className={`markdown-heading markdown-h${level}`}>
            {headingContent}
          </div>
        );
      }
      
      // Check for bullet list items
      const isBulletListItem = /^\s*[•]\s+/.test(line);
      
      if (line.trim() === '') {
        // Empty line - reduce spacing between sections
        const isPrevHeading = i > 0 && text.split('\n')[i-1].match(/^(#{1,6})\s+(.+)$/);
        return isPrevHeading ? null : <div key={i} style={{ height: '8px' }}></div>;
      } else if (isBulletListItem) {
        // List item with consistent bullet styling
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
  
  // Handle bold text formatting (text wrapped in ** or __)
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

export default FormattedMessageContent;