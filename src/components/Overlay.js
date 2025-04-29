import React from 'react';
import './Overlay.scss';

const Overlay = ({ isVisible, onClick }) => {
  if (!isVisible) return null;
  
  return (
    <div className="overlay" onClick={onClick}></div>
  );
};

export default Overlay;