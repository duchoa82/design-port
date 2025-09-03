import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple demo analyzer
const demoAnalyze = (url, userId) => {
  return {
    success: true,
    analysis: `
**Website Analysis for ${url}**

## 1. Website Purpose & Functionality
- This is a demo analysis of the website
- The tool is designed to analyze website structure and design
- Target audience: Web developers and designers

## 2. Technical Implementation
- Framework: Demo mode (no actual crawling)
- CSS: Modern responsive design patterns
- Performance: Optimized for demo purposes

## 3. Design & UX Analysis
- Clean and modern interface
- Good user experience flow
- Mobile-responsive design

## 4. SEO & Optimization
- Meta tags properly implemented
- Good semantic HTML structure
- Fast loading times

## 5. Improvement Suggestions
- Add more interactive features
- Implement real-time analysis
- Add more detailed technical insights

*Note: This is a demo analysis. Real AI analysis will be added later.*
`,
    metaData: {
      title: `Demo Analysis for ${url}`,
      description: "This is a demo analysis of the website",
      keywords: "demo, analysis, website"
    },
    timestamp: new Date().toISOString()
  };
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/web-analyzer/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Web Analyzer API is working!',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/web-analyzer/demo', (req, res) => {
  try {
    const { url, userId } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const result = demoAnalyze(url, userId);
    res.json(result);
  } catch (error) {
    console.error('Demo analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Demo analysis failed'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Web Analyzer server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: development`);
});
