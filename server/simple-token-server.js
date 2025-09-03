// Simple Token Server (No AI dependencies)
// Test token system without AI complications

import express from 'express';
import cors from 'cors';
import { 
  generateUserFingerprint, 
  initializeUser, 
  hasTokens, 
  consumeToken, 
  getUserTokenStatus,
  requestTokens,
  getAllPendingRequests, 
  approveTokenRequest, 
  rejectTokenRequest,
  getAllUsers
} from './token-manager.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Token Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Token APIs
app.get('/api/token/status', (req, res) => {
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

app.post('/api/token/consume', (req, res) => {
  try {
    const { feature } = req.body;
    const fingerprint = generateUserFingerprint(req);
    
    initializeUser(fingerprint);
    
    if (!hasTokens(fingerprint)) {
      return res.status(403).json({
        success: false,
        message: 'No tokens remaining',
        code: 'NO_TOKENS'
      });
    }
    
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

app.post('/api/token/request', (req, res) => {
  try {
    const { email, reason } = req.body;
    const fingerprint = generateUserFingerprint(req);
    
    if (!email || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Email and reason are required'
      });
    }
    
    initializeUser(fingerprint);
    const requestId = requestTokens(fingerprint, email, reason);
    
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

// Admin APIs
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  
  if (password === 'admin123') {
    res.json({ 
      success: true, 
      message: 'Admin authenticated',
      token: 'admin-token'
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid admin password' 
    });
  }
});

app.get('/api/admin/requests', (req, res) => {
  try {
    const requests = getAllPendingRequests();
    res.json({
      success: true,
      requests: requests.map(req => ({
        id: req.id,
        email: req.email,
        reason: req.reason,
        createdAt: req.createdAt,
        fingerprint: req.fingerprint.substring(0, 8) + '...'
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

app.post('/api/admin/requests/:requestId/approve', (req, res) => {
  try {
    const { requestId } = req.params;
    const success = approveTokenRequest(requestId, 'admin');
    
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

app.post('/api/admin/requests/:requestId/reject', (req, res) => {
  try {
    const { requestId } = req.params;
    const success = rejectTokenRequest(requestId, 'admin');
    
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

app.get('/api/admin/users', (req, res) => {
  try {
    const users = getAllUsers();
    res.json({
      success: true,
      users: users.map(user => ({
        fingerprint: user.fingerprint.substring(0, 8) + '...',
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

// Admin Dashboard
app.get('/admin', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Token Management Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8" x-data="adminDashboard()">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Token Management Admin</h1>
            <p class="text-gray-600">Simple token system without AI dependencies</p>
        </div>

        <!-- Login Form -->
        <div x-show="!isAuthenticated" class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Admin Login</h2>
            <form @submit.prevent="login()">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input 
                        type="password" 
                        x-model="password" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter admin password"
                        required
                    >
                </div>
                <button 
                    type="submit" 
                    :disabled="isLoading"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    <span x-show="!isLoading">Login</span>
                    <span x-show="isLoading">Logging in...</span>
                </button>
            </form>
        </div>

        <!-- Main Dashboard -->
        <div x-show="isAuthenticated">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Pending Requests</h3>
                    <p class="text-3xl font-bold text-blue-600" x-text="stats.pendingRequests"></p>
                </div>
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Total Users</h3>
                    <p class="text-3xl font-bold text-green-600" x-text="stats.totalUsers"></p>
                </div>
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Total Tokens Used</h3>
                    <p class="text-3xl font-bold text-purple-600" x-text="stats.totalTokensUsed"></p>
                </div>
            </div>

            <!-- Pending Requests -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-gray-800">Pending Token Requests</h2>
                    <button @click="loadPendingRequests()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Refresh
                    </button>
                </div>
                
                <div x-show="pendingRequests.length === 0" class="text-center py-8 text-gray-500">
                    No pending requests
                </div>
                
                <div x-show="pendingRequests.length > 0" class="space-y-4">
                    <template x-for="request in pendingRequests" :key="request.id">
                        <div class="border border-gray-200 rounded-lg p-4">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <p class="font-medium text-gray-800" x-text="request.email"></p>
                                    <p class="text-sm text-gray-500" x-text="'Fingerprint: ' + request.fingerprint"></p>
                                    <p class="text-sm text-gray-500" x-text="'Requested: ' + new Date(request.createdAt).toLocaleString()"></p>
                                </div>
                                <div class="flex gap-2">
                                    <button 
                                        @click="approveRequest(request.id)"
                                        class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        @click="rejectRequest(request.id)"
                                        class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                            <p class="text-gray-700" x-text="request.reason"></p>
                        </div>
                    </template>
                </div>
            </div>

            <!-- All Users -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-gray-800">All Users</h2>
                    <button @click="loadAllUsers()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Refresh
                    </button>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full table-auto">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Fingerprint</th>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Tokens Remaining</th>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Total Used</th>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Last Used</th>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Requests</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template x-for="user in allUsers" :key="user.fingerprint">
                                <tr class="border-b border-gray-200">
                                    <td class="px-4 py-2 text-sm text-gray-800" x-text="user.fingerprint"></td>
                                    <td class="px-4 py-2 text-sm text-gray-800" x-text="user.tokensRemaining"></td>
                                    <td class="px-4 py-2 text-sm text-gray-800" x-text="user.totalUsed"></td>
                                    <td class="px-4 py-2 text-sm text-gray-800" x-text="user.lastUsed ? new Date(user.lastUsed).toLocaleString() : 'Never'"></td>
                                    <td class="px-4 py-2 text-sm text-gray-800" x-text="user.requestCount"></td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        function adminDashboard() {
            return {
                isAuthenticated: false,
                isLoading: false,
                password: '',
                pendingRequests: [],
                allUsers: [],
                stats: {
                    pendingRequests: 0,
                    totalUsers: 0,
                    totalTokensUsed: 0
                },

                async login() {
                    this.isLoading = true;
                    try {
                        const response = await fetch('/api/admin/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ password: this.password }),
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            this.isAuthenticated = true;
                            this.loadDashboard();
                        } else {
                            alert('Invalid password');
                        }
                    } catch (error) {
                        alert('Login failed');
                    } finally {
                        this.isLoading = false;
                    }
                },

                async loadDashboard() {
                    await Promise.all([
                        this.loadPendingRequests(),
                        this.loadAllUsers()
                    ]);
                    this.calculateStats();
                },

                async loadPendingRequests() {
                    try {
                        const response = await fetch('/api/admin/requests');
                        const data = await response.json();
                        
                        if (data.success) {
                            this.pendingRequests = data.requests;
                        }
                    } catch (error) {
                        console.error('Failed to load pending requests:', error);
                    }
                },

                async loadAllUsers() {
                    try {
                        const response = await fetch('/api/admin/users');
                        const data = await response.json();
                        
                        if (data.success) {
                            this.allUsers = data.users;
                        }
                    } catch (error) {
                        console.error('Failed to load users:', error);
                    }
                },

                async approveRequest(requestId) {
                    this.isLoading = true;
                    try {
                        const response = await fetch(`/api/admin/requests/${requestId}/approve`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ approvedBy: 'admin' }),
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            await this.loadPendingRequests();
                            await this.loadAllUsers();
                            this.calculateStats();
                        } else {
                            alert('Failed to approve request');
                        }
                    } catch (error) {
                        alert('Failed to approve request');
                    } finally {
                        this.isLoading = false;
                    }
                },

                async rejectRequest(requestId) {
                    this.isLoading = true;
                    try {
                        const response = await fetch(`/api/admin/requests/${requestId}/reject`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ approvedBy: 'admin' }),
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            await this.loadPendingRequests();
                            this.calculateStats();
                        } else {
                            alert('Failed to reject request');
                        }
                    } catch (error) {
                        alert('Failed to reject request');
                    } finally {
                        this.isLoading = false;
                    }
                },

                calculateStats() {
                    this.stats.pendingRequests = this.pendingRequests.length;
                    this.stats.totalUsers = this.allUsers.length;
                    this.stats.totalTokensUsed = this.allUsers.reduce((sum, user) => sum + user.totalUsed, 0);
                }
            }
        }
    </script>
</body>
</html>
  `);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Token Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Token status: http://localhost:${PORT}/api/token/status`);
  console.log(`👨‍💼 Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`🔐 Admin password: admin123`);
});
