import Anthropic from '@anthropic-ai/sdk';

class AIService {
  constructor() {
    if (!process.env.CLAUDE_API_KEY) {
      console.warn('CLAUDE_API_KEY not found. AI analysis will be disabled.');
      this.client = null;
    } else {
      this.client = new Anthropic({
        apiKey: process.env.CLAUDE_API_KEY
      });
    }
  }

  async analyzeWebsite(crawlData) {
    try {
      if (!this.client) {
        throw new Error('Claude API key not configured. Please add CLAUDE_API_KEY to your environment variables.');
      }

      const prompt = `
You are a web development expert. Analyze this website and provide detailed insights:

URL: ${crawlData.url}

META DATA:
- Title: ${crawlData.metaData.title}
- Description: ${crawlData.metaData.description}
- Keywords: ${crawlData.metaData.keywords}

HTML STRUCTURE (first 2000 chars):
${crawlData.html.substring(0, 2000)}

CSS STYLES (first 1500 chars):
${crawlData.css.substring(0, 1500)}

Please provide a comprehensive analysis covering:

1. **Website Purpose & Functionality**
   - What type of website is this?
   - Main features and functionality
   - Target audience

2. **Technical Implementation**
   - Framework/technology used (if detectable)
   - CSS architecture and patterns
   - Responsive design implementation
   - Performance considerations

3. **Design & UX Analysis**
   - Design patterns and trends
   - User experience strengths/weaknesses
   - Accessibility considerations
   - Mobile responsiveness

4. **SEO & Optimization**
   - SEO implementation quality
   - Meta tags optimization
   - Performance optimization opportunities

5. **Improvement Suggestions**
   - Technical improvements
   - Design enhancements
   - Performance optimizations
   - SEO recommendations

Format your response in clear sections with bullet points for easy reading.
`;

      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return response.content[0].text;

    } catch (error) {
      console.error('AI analysis error:', error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }
}

export default AIService;
