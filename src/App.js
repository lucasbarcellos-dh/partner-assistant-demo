import React, { useState } from 'react';
import './App.scss';
import Header from './components/Header';
import ChatDrawer from './components/ChatDrawer';
import Overlay from './components/Overlay';
import BackgroundImage from './components/BackgroundImage';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return (
    <div className="app">
      <Header openChat={openChat} />
      <main className="main-content"></main>
      <Overlay isVisible={isChatOpen} onClick={closeChat} />
      <ChatDrawer isOpen={isChatOpen} onClose={closeChat} />
    </div>
  );
}

export default App;