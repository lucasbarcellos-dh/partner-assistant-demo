import React from 'react';
import './IntroductionModal.scss';
import saraPreview from '../images/sara-preview.png';

const IntroductionModal = ({ isOpen, onClose, onShowSara }) => {
  if (!isOpen) return null;

  return (
    <div className="introduction-modal-overlay" onClick={onClose}>
      <div className="introduction-modal" onClick={(e) => e.stopPropagation()}>
        <button className="introduction-modal__close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="introduction-modal__content">
          <div className="introduction-modal__preview">
            <img src={saraPreview} alt="Sara AI Assistant Preview" className="sara-preview-image" />
          </div>

          <div className="introduction-modal__announcement">
            <span className="announcement-badge">Now live!</span>
          </div>

          <div className="introduction-modal__main">
            <h3 className="introduction-modal__main-title">
              Meet your AI assistant in<br />
              Partner Portal
            </h3>
            <p className="introduction-modal__description">
              Sara, designed to answer your questions, provide insights<br />
              recommendations and helps you grow your business.
            </p>
          </div>

          <div className="introduction-modal__actions">
            <button className="introduction-modal__btn introduction-modal__btn--secondary" onClick={onClose}>
              Remind me later
            </button>
            <button className="introduction-modal__btn introduction-modal__btn--primary" onClick={onShowSara}>
              Show me Sara
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroductionModal; 