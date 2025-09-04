import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface ProcessCardProps {
  number: string;
  title: string;
  description: string;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
  rotation?: number;
}

const ProcessCard: React.FC<ProcessCardProps> = ({ 
  number, 
  title, 
  description, 
  className = "",
  variant = 'default',
  rotation = -2
}) => {
  // Mirror effect gray color variants
  const variantColors = {
    default: {
      card: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      inner: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
      number: 'text-gray-700',
      pushpin: 'bg-gray-500'
    },
    success: {
      card: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      inner: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
      number: 'text-gray-700',
      pushpin: 'bg-gray-500'
    },
    warning: {
      card: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      inner: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
      number: 'text-gray-700',
      pushpin: 'bg-gray-500'
    },
    info: {
      card: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      inner: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
      number: 'text-gray-700',
      pushpin: 'bg-gray-500'
    }
  };

  const colors = variantColors[variant];

  return (
    <div className={`relative ${className}`}>
      {/* Main Card Container */}
      <div 
        className="relative w-80 sm:w-96 h-80 sm:h-96 rounded-xl shadow-lg backdrop-blur-md"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
          transform: `rotate(${rotation}deg)`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Pushpin */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className={`w-3 h-5 sm:w-4 sm:h-6 ${colors.pushpin} rounded-full shadow-lg relative`}>
            {/* Pushpin highlight */}
            <div className="absolute top-1 left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full opacity-60"></div>
            {/* Pushpin shadow */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-0.5 sm:w-3 sm:h-1 bg-black rounded-full opacity-20"></div>
          </div>
        </div>

        {/* Inner Content Area */}
        <div 
          className="absolute top-6 sm:top-8 left-3 sm:left-4 right-3 sm:right-4 bottom-4 sm:bottom-6 rounded-lg p-3 sm:p-4 backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          {/* Number */}
          <div className={`text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 opacity-80 ${colors.number}`}>
            {number}
          </div>
          
          {/* Title */}
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
            {title}
          </h3>
          
          {/* Description */}
          <div className="text-xs sm:text-sm text-gray-200 leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              components={{
                strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                p: ({node, ...props}) => <p className="mb-1 sm:mb-2 last:mb-0" {...props} />
              }}
            >
              {description}
            </ReactMarkdown>
          </div>
        </div>

        {/* Card shadow effect */}
        <div 
          className="absolute inset-0 rounded-xl opacity-20"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, transparent 70%)',
            transform: 'translateY(2px)'
          }}
        />

        {/* Mirror effect highlight */}
        <div 
          className="absolute inset-0 rounded-xl opacity-60"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 30%, transparent 60%)',
            pointerEvents: 'none'
          }}
        />
        
        {/* Additional mirror reflection */}
        <div 
          className="absolute inset-0 rounded-xl opacity-40"
          style={{
            background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.6) 20%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.6) 60%, transparent 80%)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Background grid lines (optional) */}
      <div 
        className="absolute inset-0 -z-10 opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 19px,
              #e5e7eb 20px
            )
          `,
          backgroundSize: '100% 20px'
        }}
      />
    </div>
  );
};

export default ProcessCard;
