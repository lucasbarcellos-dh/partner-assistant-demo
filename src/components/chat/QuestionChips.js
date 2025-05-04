import React from 'react';

const QuestionChips = ({ onSelectQuestion, isLoading }) => {
  // Sample suggested questions
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

export default QuestionChips;