import React from 'react';
import QuickQuestionButton from './QuickQuestionButton';
import './QuickQuestionsCard.scss';

const QuickQuestionsCard = ({ 
  onQuestionSelect, 
  questions = [], 
  title = "Quick Questions", 
  description = "Ask Sara about your business" 
}) => {
  const handleQuestionClick = (question) => {
    // If question is an object with display and query properties, use those
    if (typeof question === 'object' && question.display && question.query) {
      onQuestionSelect(question.query);
    } else {
      // Otherwise, just use the question as is
      onQuestionSelect(question);
    }
  };

  return (
    <div className="section-card quick-questions-card">
      <div className="section-content">
        <h2 className="section-title">{title}</h2>
        <p className="section-description">{description}</p>
        
        <div className="quick-questions-container">
          {questions.map((question, index) => (
            <QuickQuestionButton
              key={index}
              question={typeof question === 'object' ? question.display : question}
              onClick={() => handleQuestionClick(question)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickQuestionsCard;