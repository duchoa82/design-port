// Token Management System
// Manages user tokens for AI features (User Stories & UX Audit)

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { sendTokenRequestNotification, sendTokenApprovalNotification } from './email/notifier.js';

// File-based storage for persistence
const DATA_DIR = './data';
const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load data from files
function loadData() {
  try {
    const tokensData = fs.existsSync(TOKENS_FILE) ? 
      JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8')) : {};
    const requestsData = fs.existsSync(REQUESTS_FILE) ? 
      JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8')) : {};
    
    return { tokensData, requestsData };
  } catch (error) {
    console.error('Error loading data:', error);
    return { tokensData: {}, requestsData: {} };
  }
}

// Save data to files
function saveData(tokensData, requestsData) {
  try {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokensData, null, 2));
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requestsData, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Initialize storage
const { tokensData, requestsData } = loadData();
const tokenStorage = new Map(Object.entries(tokensData));
const userRequests = new Map(Object.entries(requestsData));

// Generate unique user fingerprint
export function generateUserFingerprint(req) {
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const userAgent = req.get('User-Agent') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  const acceptEncoding = req.get('Accept-Encoding') || '';
  
  // For development: normalize localhost IPs
  let normalizedIp = ip;
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    normalizedIp = '127.0.0.1';
  }
  
  // Create fingerprint string
  const fingerprintData = `${normalizedIp}-${userAgent}-${acceptLanguage}-${acceptEncoding}`;
  
  // Generate hash
  return crypto.createHash('sha256').update(fingerprintData).digest('hex');
}

// Initialize user with 4 tokens
export function initializeUser(fingerprint) {
  if (!tokenStorage.has(fingerprint)) {
    tokenStorage.set(fingerprint, {
      tokens: 4,
      totalUsed: 0,
      lastUsed: null,
      createdAt: new Date(),
      requests: []
    });
    saveToFile();
  }
  return tokenStorage.get(fingerprint);
}

// Check if user has tokens
export function hasTokens(fingerprint) {
  const user = tokenStorage.get(fingerprint);
  return user && user.tokens > 0;
}

// Save data to file
function saveToFile() {
  const tokensData = Object.fromEntries(tokenStorage);
  const requestsData = Object.fromEntries(userRequests);
  saveData(tokensData, requestsData);
}

// Consume a token
export function consumeToken(fingerprint, feature) {
  const user = tokenStorage.get(fingerprint);
  if (!user || user.tokens <= 0) {
    return false;
  }
  
  user.tokens -= 1;
  user.totalUsed += 1;
  user.lastUsed = new Date();
  user.requests.push({
    feature,
    timestamp: new Date(),
    action: 'consume'
  });
  
  saveToFile();
  return true;
}

// Get user token status
export function getUserTokenStatus(fingerprint) {
  const user = tokenStorage.get(fingerprint);
  if (!user) {
    return null;
  }
  
  return {
    tokensRemaining: user.tokens,
    totalUsed: user.totalUsed,
    lastUsed: user.lastUsed,
    createdAt: user.createdAt
  };
}

// Request more tokens
export async function requestTokens(fingerprint, email, reason) {
  const requestId = crypto.randomUUID();
  const request = {
    id: requestId,
    fingerprint,
    email,
    reason,
    status: 'pending',
    createdAt: new Date(),
    approvedAt: null,
    approvedBy: null
  };
  
  userRequests.set(requestId, request);
  
  // Add to user's request history
  const user = tokenStorage.get(fingerprint);
  if (user) {
    user.requests.push({
      feature: 'token_request',
      timestamp: new Date(),
      action: 'request',
      requestId
    });
  }
  
  saveToFile();
  
  // Send email notification
  try {
    await sendTokenRequestNotification({
      requestId,
      email,
      reason,
      fingerprint
    });
    console.log('✅ Email notification sent for token request:', requestId);
  } catch (error) {
    console.error('❌ Failed to send email notification:', error);
    // Don't throw error - request should still be saved
  }
  
  return requestId;
}

// Admin functions
export function getAllPendingRequests() {
  return Array.from(userRequests.values())
    .filter(req => req.status === 'pending')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function approveTokenRequest(requestId, approvedBy) {
  const request = userRequests.get(requestId);
  if (!request || request.status !== 'pending') {
    return false;
  }
  
  // Update request status
  request.status = 'approved';
  request.approvedAt = new Date();
  request.approvedBy = approvedBy;
  
  // Give user 4 more tokens
  const user = tokenStorage.get(request.fingerprint);
  if (user) {
    user.tokens += 4;
    user.requests.push({
      feature: 'token_approval',
      timestamp: new Date(),
      action: 'approve',
      requestId,
      approvedBy
    });
  }
  
  saveToFile();
  
  // Send email notification
  try {
    await sendTokenApprovalNotification({
      requestId,
      fingerprint: request.fingerprint,
      approvedBy
    });
    console.log('✅ Email notification sent for token approval:', requestId);
  } catch (error) {
    console.error('❌ Failed to send email notification:', error);
    // Don't throw error - approval should still work
  }
  
  return true;
}

export async function rejectTokenRequest(requestId, approvedBy) {
  const request = userRequests.get(requestId);
  if (!request || request.status !== 'pending') {
    return false;
  }
  
  request.status = 'rejected';
  request.approvedAt = new Date();
  request.approvedBy = approvedBy;
  
  saveToFile();
  
  // Note: No email notification for rejection (optional)
  console.log('✅ Token request rejected:', requestId);
  
  return true;
}

// Get all users (for admin)
export function getAllUsers() {
  return Array.from(tokenStorage.entries()).map(([fingerprint, data]) => ({
    fingerprint,
    ...data
  }));
}

// Get user by fingerprint (for admin)
export function getUserByFingerprint(fingerprint) {
  const user = tokenStorage.get(fingerprint);
  if (!user) {
    return null;
  }
  
  return {
    fingerprint,
    ...user
  };
}

// Get all requests by status
export function getAllRequests() {
  return Array.from(userRequests.values());
}

export function getAllApprovedRequests() {
  return Array.from(userRequests.values()).filter(req => req.status === 'approved');
}

export function getAllRejectedRequests() {
  return Array.from(userRequests.values()).filter(req => req.status === 'rejected');
}
