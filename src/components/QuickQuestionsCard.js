import React from 'react';
import QuickQuestionButton from './QuickQuestionButton';
import './QuickQuestionsCard.scss';

const QuickQuestionsCard = ({ onQuestionSelect }) => {
  // Define questions - could be passed as props or loaded from a config file
  const questions = [
    "How did last week go?",
    "Show me recent reviews",
    "What's popular on my menu?"
  ];

  // Map questions to desired API queries
  const questionMap = {
    "How did last week go?": "How did my business perform last week?",
    "Show me recent reviews": "What are my customers saying in recent reviews?",
    "What's popular on my menu?": "What are my most popular menu items?"
  };

  const handleQuestionClick = (displayQuestion) => {
    // Use the mapped API query if available, otherwise use the display question
    const apiQuery = questionMap[displayQuestion] || displayQuestion;
    onQuestionSelect(apiQuery);
  };

  return (
    <div className="section-card quick-questions-card">
      <div className="section-content">
        <h2 className="section-title">Quick Questions</h2>
        <p className="section-description">Ask Chefie about your business</p>
        
        <div className="quick-questions-container">
          {questions.map((question, index) => (
            <QuickQuestionButton
              key={index}
              question={question}
              onClick={handleQuestionClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickQuestionsCard;