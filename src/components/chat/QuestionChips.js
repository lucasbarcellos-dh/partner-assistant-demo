import React from 'react';

const QuestionChips = ({ onSelectQuestion, isLoading }) => {
  // Suggested questions with display and query properties
  const suggestedQuestions = [
    {
      display: "How did last week go?",
      query: "How did my business perform last week?"
    },
    {
      display: "What's ordered most on weekends?",
      query: "What are the most popular menu items customers order on weekends?"
    },
    {
      display: "Give me ideas for a new menu item",
      query: "What are some ideas for new menu items I could add to my restaurant?"
    },
    {
      display: "How are my recent reviews?",
      query: "What are customers saying in my recent reviews?"
    },
    {
      display: "What makes customers happy?",
      query: "What do customers mention most positively in their reviews and feedback?"
    },
    {
      display: "What are my best performing days?",
      query: "Which days of the week does my business perform best and why?"
    },
  ];

  const handleQuestionClick = (question) => {
    // If question is an object with display and query properties, use those
    if (typeof question === 'object' && question.display && question.query) {
      onSelectQuestion(question.query);
    } else {
      // Otherwise, just use the question as is (fallback for backwards compatibility)
      onSelectQuestion(question);
    }
  };

  return (
    <div className="question-chips-container">
      <div className="question-chips">
        {suggestedQuestions.map((question, index) => (
          <button 
            key={index} 
            className="question-chip"
            onClick={() => handleQuestionClick(question)}
            disabled={isLoading}
          >
            {typeof question === 'object' ? question.display : question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionChips;