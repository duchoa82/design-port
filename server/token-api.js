// Token API for Frontend
// Handles token consumption and requests

import express from 'express';
import { 
  generateUserFingerprint, 
  initializeUser, 
  hasTokens, 
  consumeToken, 
  getUserTokenStatus,
  requestTokens
} from './token-manager.js';

const router = express.Router();

// Get user token status
router.get('/status', (req, res) => {
  try {
    const fingerprint = generateUserFingerprint(req);
    const user = initializeUser(fingerprint);
    const status = getUserTokenStatus(fingerprint);
    
    res.json({
      success: true,
      status: {
        tokensRemaining: status.tokensRemaining,
        totalUsed: status.totalUsed,
        lastUsed: status.lastUsed,
        hasTokens: status.tokensRemaining > 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get token status',
      error: error.message
    });
  }
});

// Consume token for feature
router.post('/consume', (req, res) => {
  try {
    const { feature } = req.body; // 'user-story' or 'audit-ux'
    const fingerprint = generateUserFingerprint(req);
    
    // Initialize user if not exists
    initializeUser(fingerprint);
    
    // Check if user has tokens
    if (!hasTokens(fingerprint)) {
      return res.status(403).json({
        success: false,
        message: 'No tokens remaining',
        code: 'NO_TOKENS'
      });
    }
    
    // Consume token
    const success = consumeToken(fingerprint, feature);
    
    if (success) {
      const status = getUserTokenStatus(fingerprint);
      res.json({
        success: true,
        message: 'Token consumed successfully',
        status: {
          tokensRemaining: status.tokensRemaining,
          totalUsed: status.totalUsed
        }
      });
    } else {
      res.status(403).json({
        success: false,
        message: 'Failed to consume token',
        code: 'CONSUME_FAILED'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to consume token',
      error: error.message
    });
  }
});

// Request more tokens
router.post('/request', async (req, res) => {
  try {
    const { email, reason } = req.body;
    const fingerprint = generateUserFingerprint(req);
    
    // Validate input
    if (!email || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Email and reason are required'
      });
    }
    
    // Initialize user if not exists
    initializeUser(fingerprint);
    
    // Create token request
    const requestId = await requestTokens(fingerprint, email, reason);
    
    res.json({
      success: true,
      message: 'Token request submitted successfully',
      requestId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit token request',
      error: error.message
    });
  }
});

// Check if user can use feature (without consuming token)
router.post('/check', (req, res) => {
  try {
    const { feature } = req.body;
    const fingerprint = generateUserFingerprint(req);
    
    // Initialize user if not exists
    initializeUser(fingerprint);
    
    const canUse = hasTokens(fingerprint);
    const status = getUserTokenStatus(fingerprint);
    
    res.json({
      success: true,
      canUse,
      status: {
        tokensRemaining: status.tokensRemaining,
        totalUsed: status.totalUsed,
        hasTokens: status.tokensRemaining > 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check token status',
      error: error.message
    });
  }
});

export default router;
