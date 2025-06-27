import React from 'react';
import './DemoNotice.scss';

const DemoNotice = () => {
  return (
    <div className="demo-notice">
      <div className="demo-notice-content">
        <span className="demo-notice-text">
        This is an AI assistant demo for the Partner Portal using OpenAI's Responses API.
        </span>
        <a 
          href="https://github.com/lucasbarcellos-dh/partner-assistant-demo/tree/ee9a9a034f56434fd2b8e2378cfb8dbe819654c5/api/files" 
          target="_blank" 
          rel="noopener noreferrer"
          className="demo-notice-link"
        >
          View knowledge base
        </a>
      </div>
    </div>
  );
};

export default DemoNotice; 