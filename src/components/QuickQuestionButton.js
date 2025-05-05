import React from 'react';
import SparkIcon from './SparkIcon';
import './QuickQuestionButton.scss';

const QuickQuestionButton = ({ question, onClick }) => {
  return (
    <button 
      className="quick-question-button"
      onClick={() => onClick(question)}
    >
      <div className="button-content">
        <SparkIcon width={20} height={20} />
        <span>{question}</span>
      </div>
    </button>
  );
};

export default QuickQuestionButton;