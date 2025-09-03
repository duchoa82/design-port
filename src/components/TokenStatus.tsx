// Token Status Component
// Displays user's token status

import React from 'react';
import { Zap, AlertCircle, CheckCircle } from 'lucide-react';

interface TokenStatusProps {
  tokensRemaining: number;
  totalUsed: number;
  hasTokens: boolean;
  isLoading?: boolean;
}

export default function TokenStatus({ 
  tokensRemaining, 
  totalUsed, 
  hasTokens, 
  isLoading = false 
}: TokenStatusProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
        <span className="text-sm text-muted-foreground">Loading tokens...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
      hasTokens 
        ? 'bg-green-50 border border-green-200' 
        : 'bg-red-50 border border-red-200'
    }`}>
      {hasTokens ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <AlertCircle className="w-4 h-4 text-red-600" />
      )}
      
      <div className="flex items-center gap-1">
        <Zap className="w-3 h-3 text-primary" />
        <span className={`text-sm font-medium ${
          hasTokens ? 'text-green-700' : 'text-red-700'
        }`}>
          {tokensRemaining} tokens
        </span>
      </div>
      
      {totalUsed > 0 && (
        <span className="text-xs text-muted-foreground">
          ({totalUsed} used)
        </span>
      )}
    </div>
  );
}
