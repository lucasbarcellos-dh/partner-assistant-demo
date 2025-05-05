// src/App.js
import React, { useState } from 'react';
import './App.scss';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatDrawer from './components/ChatDrawer';
import Overlay from './components/Overlay';
import QuickQuestionsCard from './components/QuickQuestionsCard';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [quickQuestion, setQuickQuestion] = useState('');

  const openChat = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setQuickQuestion('');
  };

  const handleQuickQuestion = (question) => {
    setQuickQuestion(question);
    setIsChatOpen(true);
  };

  return (
    <div className="app">
      <Sidebar />
      <div className="main-container">
        <Header openChat={openChat} />
        <main className="main-content">          
          <div className="section-grid">
            {/* First row */}
            <div className="section-row">
              <QuickQuestionsCard onQuestionSelect={handleQuickQuestion} />
              <div className="section-card">
                <div className="section-content"></div>
              </div>
            </div>

            {/* Second row */}
            <div className="section-row">
              <div className="section-card">
                <div className="section-content"></div>
              </div>
            </div>

            {/* Third row */}
            <div className="section-row">
              <div className="section-card">
                <div className="section-content"></div>
              </div>
              <div className="section-card">
                <div className="section-content"></div>
              </div>
              <div className="section-card">
                <div className="section-content"></div>
              </div>
            </div>

            {/* Fourth row */}
            <div className="section-row">
              <div className="section-card">
                <div className="section-content"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Overlay isVisible={isChatOpen} onClick={closeChat} />
      <ChatDrawer isOpen={isChatOpen} onClose={closeChat} initialQuestion={quickQuestion} />
    </div>
  );
}

export default App;