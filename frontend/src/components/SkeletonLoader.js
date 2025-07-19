import React from 'react';

const skeletonStyle = {
  backgroundColor: '#e0e0e0',
  borderRadius: '4px',
  height: '20px',
  margin: '10px 0',
  animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
};

const keyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }
`;

const SkeletonLoader = ({ count = 5 }) => (
  <div data-testid="skeleton-loader">
    <style>{keyframes}</style>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} style={skeletonStyle} />
    ))}
  </div>
);

export default SkeletonLoader;