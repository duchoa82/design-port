# 🚀 Backend Setup Guide

Your portfolio chat widget now has a complete backend API! Here's how to get everything running.

## 📋 What We've Built

### **Backend Features:**
- ✅ **Express.js API server** with security middleware
- ✅ **AI-powered chat responses** (OpenAI integration + fallback)
- ✅ **Conversation management** with unique IDs
- ✅ **Rate limiting** and CORS protection
- ✅ **Health monitoring** endpoints
- ✅ **Error handling** and logging

### **Frontend Integration:**
- ✅ **Real API calls** instead of mock responses
- ✅ **Conversation persistence** across sessions
- ✅ **Fallback to mock responses** if API fails
- ✅ **Error handling** for network issues

## 🛠️ Quick Setup

### **1. Install Backend Dependencies**
```bash
cd server
npm install
```

### **2. Configure Environment**
```bash
cp env.example .env
```

Edit `.env` file:
```env
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here  # Optional
JWT_SECRET=your_random_secret_here
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### **3. Start the Backend Server**
```bash
npm run dev
```

You should see:
```
🚀 Chat API server running on port 3001
📊 Health check: http://localhost:3001/api/health
💬 Chat endpoint: http://localhost:3001/api/chat
🌍 Environment: development
🤖 OpenAI integration: Disabled (set OPENAI_API_KEY to enable)
```

### **4. Test the API**
```bash
node test-api.js
```

### **5. Start Your Frontend**
```bash
# In a new terminal, from the root directory
npm run dev
```

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/chat` | POST | Send message, get AI response |
| `/api/chat/:id` | GET | Get conversation history |
| `/api/chat/:id` | DELETE | Clear conversation |

## 🤖 AI Integration Options

### **Option 1: OpenAI (Recommended)**
1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to `.env`: `OPENAI_API_KEY=sk-your-key-here`
3. Restart server

### **Option 2: Fallback Responses (No API Key Needed)**
The system automatically uses keyword-based responses when OpenAI is not available.

## 🔧 Customization

### **Update Portfolio Information**
Edit `server/server.js` - find the `PORTFOLIO_INFO` object:

```javascript
const PORTFOLIO_INFO = {
  name: "Your Name",
  role: "Your Role",
  skills: ["Skill 1", "Skill 2", ...],
  experience: ["Experience 1", "Experience 2", ...],
  projects: ["Project 1", "Project 2", ...],
  education: "Your Education",
  interests: ["Interest 1", "Interest 2", ...]
};
```

### **Add Custom Responses**
In `server/server.js`, find the `responses` object in `generateAIResponse()`:

```javascript
const responses = {
  'your-keyword': 'Your custom response here',
  // ... existing responses
};
```

## 🧪 Testing

### **Manual Testing**
1. Start both servers (backend + frontend)
2. Open your portfolio in browser
3. Click the chat widget
4. Try the preset questions
5. Type custom messages

### **API Testing**
```bash
# Health check
curl http://localhost:3001/api/health

# Send message
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are your skills?"}'
```

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Only allows requests from configured origins
- **Input Validation**: All messages are validated
- **Error Handling**: Graceful error responses
- **Logging**: Request logs for monitoring

## 🚀 Production Deployment

### **Environment Variables for Production**
```env
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_production_key
JWT_SECRET=your_secure_secret
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_MAX_REQUESTS=50
```

### **Recommended Hosting**
- **Vercel**: Easy deployment with serverless functions
- **Railway**: Simple Node.js hosting
- **Heroku**: Traditional hosting with easy scaling
- **DigitalOcean**: VPS with full control

## 🐛 Troubleshooting

### **Common Issues**

**1. CORS Errors**
```
Error: Not allowed by CORS
```
**Solution**: Check `ALLOWED_ORIGINS` in `.env`

**2. Rate Limiting**
```
Too many requests from this IP
```
**Solution**: Increase limits in production or wait

**3. OpenAI Errors**
```
OpenAI API error: ...
```
**Solution**: Check API key and billing status

**4. Port Already in Use**
```
EADDRINUSE: address already in use
```
**Solution**: Change `PORT` in `.env` or kill existing process

### **Debug Mode**
Add to `.env`:
```env
DEBUG=true
NODE_ENV=development
```

## 📊 Monitoring

### **Health Check**
```bash
curl http://localhost:3001/api/health
```

### **Logs**
The server logs:
- All requests (with Morgan)
- Errors and exceptions
- OpenAI API calls
- Rate limiting events

## 🔄 Next Steps

### **Immediate Improvements**
- [ ] Add database for message persistence
- [ ] Implement user authentication
- [ ] Add analytics dashboard
- [ ] WebSocket for real-time features

### **Advanced Features**
- [ ] File upload support
- [ ] Multi-language responses
- [ ] Voice chat integration
- [ ] Advanced AI models

## 📞 Support

If you encounter any issues:
1. Check the logs in your terminal
2. Verify all environment variables
3. Test the API endpoints manually
4. Check the troubleshooting section above

---

**🎉 Congratulations!** Your portfolio now has a fully functional AI-powered chat backend! 