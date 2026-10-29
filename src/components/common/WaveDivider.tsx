import React from 'react';

interface WaveDividerProps {
  fillColor?: string;
  isFlipped?: boolean;
  className?: string;
}

export const WaveDivider: React.FC<WaveDividerProps> = ({
  fillColor = '#FFFFFF',
  isFlipped = false,
  className = ''
}) => {
  return (
    <div
      className={`w-full overflow-hidden leading-none pointer-events-none ${
        isFlipped ? 'rotate-180' : ''
      } ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="relative block w-full h-12 md:h-20 lg:h-24"
      >
        <path
          d="M0,0 C150,90 350,-40 500,50 C650,140 900,10 1200,40 L1200,120 L0,120 Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
};
