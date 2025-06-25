import React, { useState } from 'react';
import SparkIcon from './SparkIcon';
import './AnimationDemo.scss';

const AnimationDemo = () => {
  const [selectedAnimation, setSelectedAnimation] = useState('magical');
  
  const animations = [
    { name: 'none', label: 'No Animation' },
    { name: 'pulse', label: 'Sparkle Pulse' },
    { name: 'shimmer', label: 'Rotating Shimmer' },
    { name: 'bounce', label: 'Floating Bounce' },
    { name: 'flow', label: 'Gradient Flow' },
    { name: 'magical', label: 'Magical (Combined)' }
  ];

  return (
    <div className="animation-demo">
      <div className="demo-header">
        <h2>SparkIcon Animation Preview</h2>
        <p>Choose an animation style for your chat icon:</p>
      </div>
      
      <div className="demo-preview">
        <div className="preview-icon">
          <SparkIcon 
            width={64} 
            height={64} 
            animation={selectedAnimation === 'none' ? null : selectedAnimation} 
          />
        </div>
      </div>
      
      <div className="demo-controls">
        {animations.map((anim) => (
          <button
            key={anim.name}
            className={`demo-button ${selectedAnimation === anim.name ? 'active' : ''}`}
            onClick={() => setSelectedAnimation(anim.name)}
          >
            {anim.label}
          </button>
        ))}
      </div>
      
      <div className="demo-code">
        <h3>Usage:</h3>
        <code>
          {selectedAnimation === 'none' 
            ? `<SparkIcon width={24} height={24} />`
            : `<SparkIcon width={24} height={24} animation="${selectedAnimation}" />`
          }
        </code>
      </div>
      
      <div className="demo-sizes">
        <h3>Different Sizes:</h3>
        <div className="size-examples">
          <div className="size-example">
            <SparkIcon 
              width={20} 
              height={20} 
              animation={selectedAnimation === 'none' ? null : selectedAnimation} 
            />
            <span>20px</span>
          </div>
          <div className="size-example">
            <SparkIcon 
              width={24} 
              height={24} 
              animation={selectedAnimation === 'none' ? null : selectedAnimation} 
            />
            <span>24px</span>
          </div>
          <div className="size-example">
            <SparkIcon 
              width={32} 
              height={32} 
              animation={selectedAnimation === 'none' ? null : selectedAnimation} 
            />
            <span>32px</span>
          </div>
          <div className="size-example">
            <SparkIcon 
              width={48} 
              height={48} 
              animation={selectedAnimation === 'none' ? null : selectedAnimation} 
            />
            <span>48px</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationDemo; 