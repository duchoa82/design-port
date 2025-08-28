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
  // Color variants
  const variantColors = {
    default: {
      card: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
      inner: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
      number: 'text-orange-600',
      pushpin: 'bg-orange-400'
    },
    success: {
      card: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      inner: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
      number: 'text-green-600',
      pushpin: 'bg-green-400'
    },
    warning: {
      card: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      inner: 'linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)',
      number: 'text-yellow-600',
      pushpin: 'bg-yellow-400'
    },
    info: {
      card: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      inner: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)',
      number: 'text-blue-600',
      pushpin: 'bg-blue-400'
    }
  };

  const colors = variantColors[variant];

  return (
    <div className={`relative ${className}`}>
      {/* Main Card Container */}
      <div 
        className="relative w-96 h-96 rounded-xl shadow-lg backdrop-blur-md"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)',
          transform: `rotate(${rotation}deg)`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Pushpin */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className={`w-4 h-6 ${colors.pushpin} rounded-full shadow-lg relative`}>
            {/* Pushpin highlight */}
            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-60"></div>
            {/* Pushpin shadow */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-black rounded-full opacity-20"></div>
          </div>
        </div>

        {/* Inner Content Area */}
        <div 
          className="absolute top-8 left-4 right-4 bottom-6 rounded-lg p-4 backdrop-blur-sm"
          style={{
            background: variant === 'default' ? 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)' :
                       variant === 'success' ? 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)' :
                       variant === 'warning' ? 'linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)' :
                       variant === 'info' ? 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)' :
                       'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          {/* Number */}
          <div className={`text-4xl font-bold mb-3 opacity-80 ${colors.number}`}>
            {number}
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            {title}
          </h3>
          
          {/* Description */}
          <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              components={{
                strong: ({node, ...props}) => <strong className="font-semibold text-gray-800" {...props} />,
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
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

        {/* Glass highlight effect */}
        <div 
          className="absolute inset-0 rounded-xl opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
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
