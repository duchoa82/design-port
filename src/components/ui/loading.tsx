import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-primary/20 border-t-primary`} />
        
        {/* Loading text */}
        {text && (
          <p className="text-muted-foreground font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
