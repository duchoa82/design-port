// Admin API for Token Management
// Separate admin system for managing token requests

import express from 'express';
import { 
  getAllPendingRequests, 
  getAllApprovedRequests,
  getAllRejectedRequests,
  getAllRequests,
  approveTokenRequest, 
  rejectTokenRequest,
  getAllUsers,
  getUserByFingerprint
} from './token-manager.js';

const router = express.Router();

// Simple admin authentication (in production, use proper auth)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Admin login
router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    res.json({ 
      success: true, 
      message: 'Admin authenticated',
      token: 'admin-token' // In production, use JWT
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid admin password' 
    });
  }
});

// Get requests by status
router.get('/admin/requests', (req, res) => {
  try {
    const { status } = req.query;
    let requests;
    
    if (status === 'pending') {
      requests = getAllPendingRequests();
    } else if (status === 'approved') {
      requests = getAllApprovedRequests();
    } else if (status === 'rejected') {
      requests = getAllRejectedRequests();
    } else {
      // Return all requests if no status specified
      requests = getAllRequests();
    }
    
    res.json({
      success: true,
      requests: requests.map(req => ({
        id: req.id,
        email: req.email,
        reason: req.reason,
        createdAt: req.createdAt,
        fingerprint: req.fingerprint,
        status: req.status,
        approvedAt: req.approvedAt,
        approvedBy: req.approvedBy
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
});

// Approve token request
router.post('/admin/requests/:requestId/approve', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approvedBy } = req.body;
    
    const success = await approveTokenRequest(requestId, approvedBy || 'admin');
    
    if (success) {
      res.json({
        success: true,
        message: 'Token request approved successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Request not found or already processed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve request',
      error: error.message
    });
  }
});

// Reject token request
router.post('/admin/requests/:requestId/reject', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approvedBy } = req.body;
    
    const success = await rejectTokenRequest(requestId, approvedBy || 'admin');
    
    if (success) {
      res.json({
        success: true,
        message: 'Token request rejected'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Request not found or already processed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject request',
      error: error.message
    });
  }
});

// Get all users (admin dashboard)
router.get('/admin/users', (req, res) => {
  try {
    const users = getAllUsers();
    res.json({
      success: true,
      users: users.map(user => ({
        fingerprint: user.fingerprint, // Full fingerprint for admin
        tokensRemaining: user.tokens,
        totalUsed: user.totalUsed,
        lastUsed: user.lastUsed,
        createdAt: user.createdAt,
        requestCount: user.requests.filter(r => r.action === 'request').length
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get user details
router.get('/admin/users/:fingerprint', (req, res) => {
  try {
    const { fingerprint } = req.params;
    const user = getUserByFingerprint(fingerprint);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: {
        fingerprint: user.fingerprint.substring(0, 8) + '...',
        tokensRemaining: user.tokens,
        totalUsed: user.totalUsed,
        lastUsed: user.lastUsed,
        createdAt: user.createdAt,
        requests: user.requests
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
});

export default router;
