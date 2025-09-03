import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple crawler function
const crawlWebsite = async (url) => {
  let browser = null;
  try {
    console.log(`🔍 Starting to crawl: ${url}`);
    
    // Launch browser
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set user agent
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    // Navigate to URL
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);
    
    // Extract HTML elements content in simple format
    const htmlElements = await page.evaluate(() => {
      const elements = {};
      
      // Helper function to get content or null
      const getContentOrNull = (selector, mapper = el => el.textContent.trim()) => {
        const items = Array.from(document.querySelectorAll(selector)).map(mapper).filter(text => text.length > 0);
        return items.length > 0 ? items : null;
      };
      
      // 1. Heading (Cấu trúc nội dung)
      elements.h1 = getContentOrNull('h1');
      elements.h2 = getContentOrNull('h2');
      elements.h3 = getContentOrNull('h3');
      
      // 2. Body Content (Copywriting & Clarity)
      elements.p = getContentOrNull('p');
      const spans = Array.from(document.querySelectorAll('span')).map(el => el.textContent.trim()).filter(text => text.length > 0 && text.length < 200);
      elements.span = spans.length > 0 ? spans : null;
      elements.strong = getContentOrNull('strong');
      elements.em = getContentOrNull('em');
      elements.b = getContentOrNull('b');
      elements.i = getContentOrNull('i');
      elements.blockquote = getContentOrNull('blockquote');
      
      // 3. Navigation & Links (User flow)
      elements.nav = getContentOrNull('nav');
      const links = Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.textContent.trim(),
        href: a.href
      })).filter(link => link.text.length > 0);
      elements.a = links.length > 0 ? links : null;
      
      elements.button = getContentOrNull('button');
      
      // 4. Forms / CTA (Conversion)
      const forms = Array.from(document.querySelectorAll('form')).map(form => ({
        action: form.action || null,
        method: form.method || 'get',
        inputs: Array.from(form.querySelectorAll('input')).map(input => ({
          type: input.type,
          placeholder: input.placeholder || null,
          name: input.name || null
        })),
        textareas: Array.from(form.querySelectorAll('textarea')).map(textarea => ({
          placeholder: textarea.placeholder || null,
          name: textarea.name || null
        })),
        selects: Array.from(form.querySelectorAll('select')).map(select => ({
          name: select.name || null,
          options: Array.from(select.querySelectorAll('option')).map(option => ({
            text: option.textContent.trim(),
            value: option.value
          }))
        }))
      }));
      elements.form = forms.length > 0 ? forms : null;
      
      // 5. Lists & Structured Info
      const uls = Array.from(document.querySelectorAll('ul')).map(ul => 
        Array.from(ul.querySelectorAll('li')).map(li => li.textContent.trim()).filter(text => text.length > 0)
      );
      elements.ul = uls.length > 0 ? uls : null;
      
      const ols = Array.from(document.querySelectorAll('ol')).map(ol => 
        Array.from(ol.querySelectorAll('li')).map(li => li.textContent.trim()).filter(text => text.length > 0)
      );
      elements.ol = ols.length > 0 ? ols : null;
      
      const tables = Array.from(document.querySelectorAll('table')).map(table => ({
        headers: Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim()),
        rows: Array.from(table.querySelectorAll('tr')).map(tr => 
          Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
        )
      }));
      elements.table = tables.length > 0 ? tables : null;
      
      // 6. Media (Visual cues & Accessibility)
      const imgs = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt || null
      }));
      elements.img = imgs.length > 0 ? imgs : null;
      
      const svgs = Array.from(document.querySelectorAll('svg')).map(svg => svg.outerHTML);
      elements.svg = svgs.length > 0 ? svgs : null;
      
      // 7. Layout Semantics (Ngữ cảnh)
      elements.header = getContentOrNull('header');
      elements.footer = getContentOrNull('footer');
      elements.section = getContentOrNull('section');
      elements.article = getContentOrNull('article');
      elements.aside = getContentOrNull('aside');
      
      return elements;
    });
    
    // Extract CSS properties by categories for UX/UI analysis
    const cssAnalysis = await page.evaluate(() => {
      const analysis = {
        typography: {
          fontFamily: [],
          fontSize: [],
          fontWeight: [],
          lineHeight: [],
          letterSpacing: [],
          wordSpacing: []
        },
        color: {
          color: [],
          backgroundColor: [],
          borderColor: [],
          gradients: [],
          overlays: []
        },
        spacing: {
          margin: [],
          padding: [],
          gap: [],
          width: [],
          maxWidth: [],
          height: []
        },
        hierarchy: {
          zIndex: [],
          display: [],
          position: [],
          flex: [],
          grid: [],
          visibility: [],
          opacity: []
        },
        interaction: {
          hover: [],
          focus: [],
          active: [],
          cursor: [],
          transition: [],
          animation: []
        },
        responsiveness: {
          mediaQueries: [],
          viewportUnits: [],
          flexibleUnits: []
        }
      };

      // Helper function to extract CSS properties
      const extractCSSProperties = (styleSheet) => {
        try {
          if (styleSheet.cssRules) {
            Array.from(styleSheet.cssRules).forEach(rule => {
              if (rule.type === CSSRule.STYLE_RULE) {
                const style = rule.style;
                
                // 1. Typography
                if (style.fontFamily) analysis.typography.fontFamily.push(style.fontFamily);
                if (style.fontSize) analysis.typography.fontSize.push(style.fontSize);
                if (style.fontWeight) analysis.typography.fontWeight.push(style.fontWeight);
                if (style.lineHeight) analysis.typography.lineHeight.push(style.lineHeight);
                if (style.letterSpacing) analysis.typography.letterSpacing.push(style.letterSpacing);
                if (style.wordSpacing) analysis.typography.wordSpacing.push(style.wordSpacing);
                
                // 2. Color & Contrast
                if (style.color) analysis.color.color.push(style.color);
                if (style.backgroundColor) analysis.color.backgroundColor.push(style.backgroundColor);
                if (style.borderColor) analysis.color.borderColor.push(style.borderColor);
                
                // 3. Spacing & Layout
                if (style.margin) analysis.spacing.margin.push(style.margin);
                if (style.padding) analysis.spacing.padding.push(style.padding);
                if (style.gap) analysis.spacing.gap.push(style.gap);
                if (style.width) analysis.spacing.width.push(style.width);
                if (style.maxWidth) analysis.spacing.maxWidth.push(style.maxWidth);
                if (style.height) analysis.spacing.height.push(style.height);
                
                // 4. Hierarchy & CTA
                if (style.zIndex) analysis.hierarchy.zIndex.push(style.zIndex);
                if (style.display) analysis.hierarchy.display.push(style.display);
                if (style.position) analysis.hierarchy.position.push(style.position);
                if (style.flex) analysis.hierarchy.flex.push(style.flex);
                if (style.grid) analysis.hierarchy.grid.push(style.grid);
                if (style.visibility) analysis.hierarchy.visibility.push(style.visibility);
                if (style.opacity) analysis.hierarchy.opacity.push(style.opacity);
                
                // 5. Interaction / Feedback
                if (style.cursor) analysis.interaction.cursor.push(style.cursor);
                if (style.transition) analysis.interaction.transition.push(style.transition);
                if (style.animation) analysis.interaction.animation.push(style.animation);
              }
              
              // Check for pseudo-classes
              if (rule.type === CSSRule.STYLE_RULE && rule.selectorText) {
                if (rule.selectorText.includes(':hover')) {
                  analysis.interaction.hover.push(rule.selectorText);
                }
                if (rule.selectorText.includes(':focus')) {
                  analysis.interaction.focus.push(rule.selectorText);
                }
                if (rule.selectorText.includes(':active')) {
                  analysis.interaction.active.push(rule.selectorText);
                }
              }
              
              // Check for media queries
              if (rule.type === CSSRule.MEDIA_RULE) {
                analysis.responsiveness.mediaQueries.push(rule.conditionText);
              }
            });
          }
        } catch (e) {
          console.log('Skipped external stylesheet');
        }
      };

      // Extract from all stylesheets
      const styles = Array.from(document.styleSheets);
      styles.forEach(styleSheet => {
        extractCSSProperties(styleSheet);
      });

      // Also check inline styles
      const elementsWithInlineStyles = document.querySelectorAll('[style]');
      elementsWithInlineStyles.forEach(el => {
        const style = el.style;
        if (style.fontFamily) analysis.typography.fontFamily.push(style.fontFamily);
        if (style.fontSize) analysis.typography.fontSize.push(style.fontSize);
        if (style.color) analysis.color.color.push(style.color);
        if (style.backgroundColor) analysis.color.backgroundColor.push(style.backgroundColor);
        // Add more inline style checks as needed
      });

      // Clean up duplicates and filter meaningful values
      Object.keys(analysis).forEach(category => {
        Object.keys(analysis[category]).forEach(property => {
          const values = analysis[category][property];
          // Remove duplicates and filter out empty values
          analysis[category][property] = [...new Set(values)].filter(val => val && val.trim() !== '');
          // If no values, set to null
          if (analysis[category][property].length === 0) {
            analysis[category][property] = null;
          }
        });
      });

      return analysis;
    });
    
    // Get basic meta info
    const metaData = await page.evaluate(() => {
      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || '',
        keywords: document.querySelector('meta[name="keywords"]')?.content || '',
        url: window.location.href
      };
    });
    
    console.log(`✅ Successfully crawled: ${url}`);
    
    // Create AI-ready prompt structure
    const createAIPrompt = (htmlElements, cssAnalysis, metaData) => {
      return {
        website: {
          url: metaData.url,
          title: metaData.title,
          description: metaData.description
        },
        content: {
          headings: {
            h1: htmlElements.h1,
            h2: htmlElements.h2,
            h3: htmlElements.h3
          },
          bodyText: {
            paragraphs: htmlElements.p,
            emphasis: {
              strong: htmlElements.strong,
              em: htmlElements.em,
              bold: htmlElements.b,
              italic: htmlElements.i,
              blockquotes: htmlElements.blockquote
            }
          },
          navigation: {
            nav: htmlElements.nav,
            links: htmlElements.a,
            buttons: htmlElements.button
          },
          forms: htmlElements.form,
          lists: {
            unordered: htmlElements.ul,
            ordered: htmlElements.ol
          },
          tables: htmlElements.table,
          media: {
            images: htmlElements.img,
            svg: htmlElements.svg
          },
          layout: {
            header: htmlElements.header,
            footer: htmlElements.footer,
            sections: htmlElements.section,
            articles: htmlElements.article,
            aside: htmlElements.aside
          }
        },
        design: {
          typography: cssAnalysis.typography,
          colors: cssAnalysis.color,
          spacing: cssAnalysis.spacing,
          hierarchy: cssAnalysis.hierarchy,
          interactions: cssAnalysis.interaction,
          responsiveness: cssAnalysis.responsiveness
        },
        analysis_instructions: {
          focus_areas: [
            "Content clarity and hierarchy",
            "Visual design consistency", 
            "User experience flow",
            "Accessibility considerations",
            "Mobile responsiveness",
            "Call-to-action effectiveness",
            "Brand messaging alignment"
          ],
          output_format: "Provide specific, actionable recommendations with examples"
        }
      };
    };

    const result = {
      success: true,
      htmlElements,
      cssAnalysis,
      metaData,
      timestamp: new Date().toISOString()
    };

    // Add AI-ready prompt structure
    result.aiPrompt = createAIPrompt(htmlElements, cssAnalysis, metaData);

    return result;
    
  } catch (error) {
    console.error(`❌ Failed to crawl ${url}:`, error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Crawl Test Server is running!',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/crawl', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }
    
    console.log(`📥 Received crawl request for: ${url}`);
    const result = await crawlWebsite(url);
    res.json(result);
    
  } catch (error) {
    console.error('Crawl endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Crawl request failed'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Crawl Test Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Crawl endpoint: http://localhost:${PORT}/api/crawl`);
  console.log(`🌍 Environment: development`);
});
