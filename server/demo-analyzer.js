// Demo Web Analyzer - No Playwright needed
export default function demoAnalyze(url) {
  // Simulate analysis without actual crawling
  const mockAnalysis = `
**Website Analysis for ${url}**

## 1. Website Purpose & Functionality
- This appears to be a demo analysis
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

*Note: This is a demo analysis. Add your Claude API key to get real AI-powered analysis.*
`;

  return {
    analysis: mockAnalysis,
    metaData: {
      title: `Demo Analysis for ${url}`,
      description: "This is a demo analysis of the website",
      keywords: "demo, analysis, website"
    },
    timestamp: new Date().toISOString()
  };
}
