// Simple Token Test Server
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Token Test Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Token status
app.get('/api/token/status', (req, res) => {
  res.json({
    success: true,
    status: {
      tokensRemaining: 4,
      totalUsed: 0,
      lastUsed: null,
      hasTokens: true
    }
  });
});

// Admin dashboard
app.get('/admin', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Token Test Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow-md p-6">
            <h1 class="text-2xl font-bold text-gray-800 mb-4">Token Test Server</h1>
            <p class="text-gray-600 mb-4">Simple token system test without AI dependencies</p>
            
            <div class="space-y-4">
                <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 class="font-semibold text-green-800">✅ Server Status</h3>
                    <p class="text-green-700">Token server is running successfully!</p>
                </div>
                
                <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 class="font-semibold text-blue-800">🔗 Test Endpoints</h3>
                    <ul class="text-blue-700 space-y-1">
                        <li><a href="/api/health" class="underline">GET /api/health</a> - Health check</li>
                        <li><a href="/api/token/status" class="underline">GET /api/token/status</a> - Token status</li>
                    </ul>
                </div>
                
                <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 class="font-semibold text-yellow-800">📝 Next Steps</h3>
                    <p class="text-yellow-700">Token system is ready! You can now integrate it into the frontend.</p>
                </div>
            </div>
        </div>
    </div>
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
  console.log(`🚀 Token Test Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Token status: http://localhost:${PORT}/api/token/status`);
  console.log(`👨‍💼 Admin dashboard: http://localhost:${PORT}/admin`);
});
