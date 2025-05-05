import React from 'react';

const FormattedMessageContent = ({ content }) => {
  if (!content) return null;

  // Parse content into sections and apply formatting
  const renderContent = () => {
    // Split text into lines for processing
    const lines = content.split('\n');
    
    // Process lines into structured content
    const elements = [];
    let currentList = null;
    let currentTable = null;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (trimmedLine === '') {
        // Only add spacing if not between heading and content
        const isPrevHeading = index > 0 && isHeading(lines[index - 1]);
        const isNextContent = index < lines.length - 1 && lines[index + 1].trim() !== '';
        
        if (!isPrevHeading || !isNextContent) {
          // elements.push(<div key={`space-${index}`} style={{ height: '8px' }} />);
        }
        return;
      }
      
      // Check for headings (# syntax)
      const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        // Close any open list before adding heading
        if (currentList) {
          elements.push(currentList);
          currentList = null;
        }
        
        // Close any open table before adding heading
        if (currentTable) {
          elements.push(currentTable);
          currentTable = null;
        }
        
        const level = headingMatch[1].length;
        const headingContent = formatInlineStyles(headingMatch[2]);
        
        elements.push(
          <div key={`heading-${index}`} className={`markdown-heading markdown-h${level}`}>
            {headingContent}
          </div>
        );
        return;
      }
      
      // Check for table rows
      // First check if it's a potential table row (contains | character)
      if (trimmedLine.includes('|')) {
        // Close any open list before starting a table
        if (currentList) {
          elements.push(currentList);
          currentList = null;
        }
        
        // Check if it's a separator row (contains only |, -, :)
        const isSeparator = /^\|?([\s-:|]+\|)+[\s-:|]+\|?$/.test(trimmedLine);
        
        // If it's a separator, just skip (we'll use CSS for styling)
        if (isSeparator) {
          // If this is the first separator and we don't have a table yet, create one
          if (!currentTable) {
            currentTable = (
              <div key={`table-${index}`} className="markdown-table-container">
                <table className="markdown-table">
                  <thead></thead>
                  <tbody></tbody>
                </table>
              </div>
            );
          }
          return;
        }
        
        // Process the table cell content
        const cells = trimmedLine
          .replace(/^\||\|$/g, '') // Remove optional leading/trailing |
          .split('|')
          .map(cell => cell.trim());
        
        // Create table row
        const rowContent = (
          <tr key={`row-${index}`}>
            {cells.map((cell, cellIndex) => (
              <td key={`cell-${index}-${cellIndex}`}>{formatInlineStyles(cell)}</td>
            ))}
          </tr>
        );
        
        // If we don't have a table yet, create one
        if (!currentTable) {
          // This is a header row
          currentTable = (
            <div key={`table-${index}`} className="markdown-table-container">
              <table className="markdown-table">
                <thead>
                  <tr key={`header-${index}`}>
                    {cells.map((cell, cellIndex) => (
                      <th key={`header-${index}-${cellIndex}`}>{formatInlineStyles(cell)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          );
        } else {
          // Add row to existing table
          const tbody = currentTable.props.children.props.children[1];
          const existingRows = tbody.props.children || [];
          // Handle both single row and array of rows cases
          const newRows = Array.isArray(existingRows) ? [...existingRows, rowContent] : [existingRows, rowContent].filter(Boolean);
          
          const newTbody = React.cloneElement(tbody, {}, newRows);
          const table = currentTable.props.children;
          const newTable = React.cloneElement(table, {}, [table.props.children[0], newTbody]);
          
          currentTable = React.cloneElement(currentTable, {}, newTable);
        }
        
        return;
      }
      
      // If we reach here and have an open table, close it
      if (currentTable) {
        elements.push(currentTable);
        currentTable = null;
      }
      
      // Check for list items (bullet points)
      const bulletMatch = trimmedLine.match(/^[•*-]\s+(.+)$/);
      if (bulletMatch) {
        const itemContent = formatInlineStyles(bulletMatch[1]);
        
        // Start a new list if one isn't open
        if (!currentList) {
          currentList = (
            <div key={`list-${index}`} className="markdown-list">
              <div className="list-item">{itemContent}</div>
            </div>
          );
        } else {
          // Add to existing list by cloning and adding new item
          const existingChildren = Array.isArray(currentList.props.children) 
            ? currentList.props.children 
            : [currentList.props.children].filter(Boolean);
            
          currentList = React.cloneElement(
            currentList,
            { key: `list-${index}` },
            [...existingChildren, <div key={`item-${index}`} className="list-item">{itemContent}</div>]
          );
        }
        return;
      }
      
      // Regular paragraph
      // Close any open list before adding paragraph
      if (currentList) {
        elements.push(currentList);
        currentList = null;
      }
      
      elements.push(
        <p key={`para-${index}`} className="paragraph">
          {formatInlineStyles(trimmedLine)}
        </p>
      );
    });
    
    // Add any remaining list or table
    if (currentList) {
      elements.push(currentList);
    }
    
    if (currentTable) {
      elements.push(currentTable);
    }
    
    return elements;
  };
  
  // Helper to check if a line is a heading
  const isHeading = (line) => {
    return line.trim().match(/^(#{1,6})\s+(.+)$/);
  };
  
  // Format inline styles (bold, italic, etc.)
  const formatInlineStyles = (text) => {
    if (!text) return null;
    
    // Process text parts
    const parts = [];
    let lastIndex = 0;
    
    // Process bold text (** or __)
    const boldRegex = /(\*\*|__)(.*?)\1/g;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before this match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add the bold text
      parts.push(<strong key={`bold-${match.index}`}>{match[2]}</strong>);
      
      // Update the last index
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  // Return the formatted content
  return (
    <div className="formatted-content">
      {renderContent()}
    </div>
  );
};

export default FormattedMessageContent;