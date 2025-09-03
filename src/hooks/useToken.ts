// Token Management Hook
// Manages token state and API calls

import { useState, useEffect, useCallback } from 'react';

interface TokenStatus {
  tokensRemaining: number;
  totalUsed: number;
  lastUsed: string | null;
  hasTokens: boolean;
}

interface UseTokenReturn {
  tokenStatus: TokenStatus | null;
  isLoading: boolean;
  error: string | null;
  consumeToken: (feature: 'user-story' | 'audit-ux') => Promise<boolean>;
  requestTokens: (email: string, reason: string) => Promise<boolean>;
  checkTokens: () => Promise<void>;
  canUseFeature: boolean;
}

export function useToken(): UseTokenReturn {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check token status
  const checkTokens = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/token/status');
      const data = await response.json();
      
      if (data.success) {
        setTokenStatus(data.status);
      } else {
        setError(data.message || 'Failed to check token status');
      }
    } catch (err) {
      setError('Network error while checking tokens');
      console.error('Token check error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Consume token for feature
  const consumeToken = useCallback(async (feature: 'user-story' | 'audit-ux'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/token/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feature }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local status
        setTokenStatus(prev => prev ? {
          ...prev,
          tokensRemaining: data.status.tokensRemaining,
          totalUsed: data.status.totalUsed,
          hasTokens: data.status.tokensRemaining > 0
        } : null);
        return true;
      } else {
        setError(data.message || 'Failed to consume token');
        return false;
      }
    } catch (err) {
      setError('Network error while consuming token');
      console.error('Token consume error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request more tokens
  const requestTokens = useCallback(async (email: string, reason: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/token/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, reason }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        return true;
      } else {
        setError(data.message || 'Failed to request tokens');
        return false;
      }
    } catch (err) {
      setError('Network error while requesting tokens');
      console.error('Token request error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check tokens on mount
  useEffect(() => {
    checkTokens();
  }, [checkTokens]);

  return {
    tokenStatus,
    isLoading,
    error,
    consumeToken,
    requestTokens,
    checkTokens,
    canUseFeature: tokenStatus?.hasTokens ?? false
  };
}
