import React from 'react';
import { Sparkles } from 'lucide-react';

// Inline CSS for bling effects - using stronger, more visible effects
const blingStyles = `
  @keyframes bling {
    0% { 
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
    25% { 
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
    }
    50% { 
      box-shadow: 0 0 30px rgba(255, 255, 255, 1), 0 0 50px rgba(255, 255, 255, 0.8);
    }
    75% { 
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
    }
    100% { 
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
  }

  @keyframes bling-overlay {
    0% { 
      opacity: 0;
      transform: translateX(-100%);
    }
    25% { 
      opacity: 0.5;
      transform: translateX(-50%);
    }
    50% { 
      opacity: 1;
      transform: translateX(0%);
    }
    75% { 
      opacity: 0.5;
      transform: translateX(50%);
    }
    100% { 
      opacity: 0;
      transform: translateX(100%);
    }
  }

  /* 3D rotation animation for icon on hover */
  .ai-brain-button:hover .ai-icon-3d {
    transform: perspective(1000px) rotateY(360deg) rotateX(15deg);
    transition: transform 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .ai-icon-3d {
    transition: transform 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform-style: preserve-3d;
  }
`;

interface AIBrainButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  showBlingEffect?: boolean;
}

export const AIBrainButton: React.FC<AIBrainButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  icon = <Sparkles className="w-4 h-4" />,
  showBlingEffect = true
}) => {
  return (
    <>
      <style>{blingStyles}</style>
      <button
        className={`ai-brain-button relative px-3 py-2 text-sm text-foreground rounded-md transition-all duration-200 font-medium overflow-hidden ${className}`}
        onClick={onClick}
        disabled={disabled}
        aria-label={typeof children === 'string' ? children : 'AI Brain Button'}
        style={{
          animation: showBlingEffect ? 'bling 2s linear infinite' : 'none'
        }}
      >
        {/* Layer dưới: fill đen */}
        <div className="absolute inset-0 bg-black rounded-md"></div>
        
        {/* Layer trên cùng: gradient BG + stroke */}
        <div 
          className="absolute inset-0 rounded-md"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(111, 111, 111, 0) 100%)',
            border: '1px solid',
            borderImage: 'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 100%) 1',
            borderRadius: '6px'
          }}
        ></div>
        
        {/* Bling effect overlay - chỉ hiện khi showBlingEffect = true */}
        {showBlingEffect && (
          <div
            className="absolute inset-0 rounded-md"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
              animation: 'bling-overlay 2s linear infinite'
            }}
          ></div>
        )}
        
        {/* Content */}
        <span className="relative z-10 text-white font-bold flex items-center justify-center gap-2 w-full">
          <span className="ai-icon-3d">
            {icon}
          </span>
          {children}
        </span>
      </button>
    </>
  );
};
