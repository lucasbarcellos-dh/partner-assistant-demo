// src/components/SparkIcon.js
import React from 'react';
import './SparkIcon.scss';

const SparkIcon = ({ 
  width = 32, 
  height = 32, 
  fill = "#FF5900", 
  animation = null,
  className = ""
}) => (
  <div className={`spark-icon-wrapper ${animation ? `spark-icon--${animation}` : ''} ${className}`}>
    <svg 
      className="spark-icon-svg"
      xmlns="http://www.w3.org/2000/svg" 
      enableBackground="new 0 0 24 24" 
      height={`${height}px`} 
      viewBox="0 0 24 24" 
      width={`${width}px`} 
      fill={fill}
    >
    <defs>
      <linearGradient id="brandedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE500" /> 
        <stop offset="50%" stopColor="#FF5900" /> 
        <stop offset="100%" stopColor="#FF0033" /> 
      </linearGradient>
      
      <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE500" /> 
        <stop offset="50%" stopColor="#FF5900" /> 
        <stop offset="100%" stopColor="#FF0033" /> 
      </linearGradient>
      
      <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE500">
          <animate attributeName="stop-color" 
                   values="#FFE500;#FF5900;#FF0033;#FFE500" 
                   dur="3s" 
                   repeatCount="indefinite"/>
        </stop>
        <stop offset="50%" stopColor="#FF5900">
          <animate attributeName="stop-color" 
                   values="#FF5900;#FF0033;#FFE500;#FF5900" 
                   dur="3s" 
                   repeatCount="indefinite"/>
        </stop>
        <stop offset="100%" stopColor="#FF0033">
          <animate attributeName="stop-color" 
                   values="#FF0033;#FFE500;#FF5900;#FF0033" 
                   dur="3s" 
                   repeatCount="indefinite"/>
        </stop>
      </linearGradient>
    </defs>
    <g><rect fill="none" height="24" width="24" x="0"/></g>
    <g className="spark-main">
      <g className="spark-elements">
        <path 
          className="spark-small spark-small--top-right"
          d="M19.46,8l0.79-1.75L22,5.46c0.39-0.18,0.39-0.73,0-0.91l-1.75-0.79L19.46,2c-0.18-0.39-0.73-0.39-0.91,0l-0.79,1.75 L16,4.54c-0.39,0.18-0.39,0.73,0,0.91l1.75,0.79L18.54,8C18.72,8.39,19.28,8.39,19.46,8z"
        />
        <path 
          className="spark-large spark-large--center"
          d="M11.5,9.5L9.91,6 C9.56,5.22,8.44,5.22,8.09,6L6.5,9.5L3,11.09c-0.78,0.36-0.78,1.47,0,1.82l3.5,1.59L8.09,18c0.36,0.78,1.47,0.78,1.82,0l1.59-3.5 l3.5-1.59c0.78-0.36,0.78-1.47,0-1.82L11.5,9.5z"
        />
        <path 
          className="spark-small spark-small--bottom-right"
          d="M18.54,16l-0.79,1.75L16,18.54c-0.39,0.18-0.39,0.73,0,0.91l1.75,0.79L18.54,22 c0.18,0.39,0.73,0.39,0.91,0l0.79-1.75L22,19.46c0.39-0.18,0.39-0.73,0-0.91l-1.75-0.79L19.46,16 C19.28,15.61,18.72,15.61,18.54,16z"
        />
      </g>
    </g>
    </svg>
  </div>
);

export default SparkIcon;