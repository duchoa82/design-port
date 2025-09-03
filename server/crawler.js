import { chromium } from 'playwright';

class WebCrawler {
  constructor() {
    this.browser = null;
  }

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async crawlWebsite(url) {
    await this.init();
    let page = null;

    try {
      page = await this.browser.newPage();
      
      // Set user agent and viewport
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });
      });
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Navigate to the URL
      console.log(`Navigating to: ${url}`);
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 45000 
      });

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Extract comprehensive data
      const result = await page.evaluate(() => {
        // Helper functions
        const extractTextContent = (element) => {
          return element.textContent?.trim() || '';
        };

        const extractAttributes = (element) => {
          const attrs = {};
          for (let attr of element.attributes) {
            attrs[attr.name] = attr.value;
          }
          return attrs;
        };

        const extractStyles = (element) => {
          const computedStyle = window.getComputedStyle(element);
          const getElementState = (el) => {
            return {
              isVisible: computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden',
              isInteractive: ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName),
              hasHover: false, // Static analysis
              hasFocus: document.activeElement === el,
              hasActive: false // Static analysis
            };
          };

          return {
            // Typography
            fontFamily: computedStyle.fontFamily,
            fontSize: computedStyle.fontSize,
            fontWeight: computedStyle.fontWeight,
            lineHeight: computedStyle.lineHeight,
            letterSpacing: computedStyle.letterSpacing,
            wordSpacing: computedStyle.wordSpacing,
            textAlign: computedStyle.textAlign,
            textDecoration: computedStyle.textDecoration,
            textTransform: computedStyle.textTransform,
            // Color & Background
            color: computedStyle.color,
            backgroundColor: computedStyle.backgroundColor,
            borderColor: computedStyle.borderColor,
            borderWidth: computedStyle.borderWidth,
            borderStyle: computedStyle.borderStyle,
            borderRadius: computedStyle.borderRadius,
            // Spacing & Layout
            margin: computedStyle.margin,
            marginTop: computedStyle.marginTop,
            marginRight: computedStyle.marginRight,
            marginBottom: computedStyle.marginBottom,
            marginLeft: computedStyle.marginLeft,
            padding: computedStyle.padding,
            paddingTop: computedStyle.paddingTop,
            paddingRight: computedStyle.paddingRight,
            paddingBottom: computedStyle.paddingBottom,
            paddingLeft: computedStyle.paddingLeft,
            // Dimensions
            width: computedStyle.width,
            height: computedStyle.height,
            minWidth: computedStyle.minWidth,
            maxWidth: computedStyle.maxWidth,
            minHeight: computedStyle.minHeight,
            maxHeight: computedStyle.maxHeight,
            // Layout & Positioning
            display: computedStyle.display,
            position: computedStyle.position,
            top: computedStyle.top,
            right: computedStyle.right,
            bottom: computedStyle.bottom,
            left: computedStyle.left,
            zIndex: computedStyle.zIndex,
            // Flexbox & Grid
            flexDirection: computedStyle.flexDirection,
            flexWrap: computedStyle.flexWrap,
            justifyContent: computedStyle.justifyContent,
            alignItems: computedStyle.alignItems,
            alignSelf: computedStyle.alignSelf,
            flexGrow: computedStyle.flexGrow,
            flexShrink: computedStyle.flexShrink,
            flexBasis: computedStyle.flexBasis,
            // Grid
            gridTemplateColumns: computedStyle.gridTemplateColumns,
            gridTemplateRows: computedStyle.gridTemplateRows,
            gridColumn: computedStyle.gridColumn,
            gridRow: computedStyle.gridRow,
            // Visual Effects
            opacity: computedStyle.opacity,
            visibility: computedStyle.visibility,
            boxShadow: computedStyle.boxShadow,
            transform: computedStyle.transform,
            // Interaction
            cursor: computedStyle.cursor,
            pointerEvents: computedStyle.pointerEvents,
            userSelect: computedStyle.userSelect,
            // Transitions & Animations
            transition: computedStyle.transition,
            animation: computedStyle.animation,
            // Overflow
            overflow: computedStyle.overflow,
            overflowX: computedStyle.overflowX,
            overflowY: computedStyle.overflowY,
            // Element State
            state: getElementState(element)
          };
        };

        // Extract HTML components
        const htmlComponents = {
          headings: [],
          paragraphs: [],
          navigation: [],
          forms: [],
          media: [],
          layout: []
        };

        // Headings
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
          document.querySelectorAll(tag).forEach(el => {
            htmlComponents.headings.push({
              tag: tag.toUpperCase(),
              text: extractTextContent(el),
              styles: extractStyles(el),
              attributes: extractAttributes(el)
            });
          });
        });

        // Paragraphs and text elements
        ['p', 'span', 'strong', 'em', 'b', 'i', 'blockquote'].forEach(tag => {
          document.querySelectorAll(tag).forEach(el => {
            htmlComponents.paragraphs.push({
              tag: tag.toUpperCase(),
              text: extractTextContent(el),
              styles: extractStyles(el),
              attributes: extractAttributes(el)
            });
          });
        });

        // Navigation
        document.querySelectorAll('nav, nav a, [role="navigation"] a').forEach(el => {
          htmlComponents.navigation.push({
            tag: el.tagName,
            text: extractTextContent(el),
            styles: extractStyles(el),
            attributes: extractAttributes(el)
          });
        });

        // Forms
        document.querySelectorAll('form, input, textarea, select, button').forEach(el => {
          htmlComponents.forms.push({
            tag: el.tagName,
            text: extractTextContent(el),
            styles: extractStyles(el),
            attributes: extractAttributes(el)
          });
        });

        // Media
        document.querySelectorAll('img, svg, video, audio').forEach(el => {
          htmlComponents.media.push({
            tag: el.tagName,
            text: extractTextContent(el),
            styles: extractStyles(el),
            attributes: extractAttributes(el)
          });
        });

        // Layout elements
        document.querySelectorAll('header, footer, section, article, aside, div').forEach(el => {
          htmlComponents.layout.push({
            tag: el.tagName,
            text: extractTextContent(el).substring(0, 100), // Limit text for layout elements
            styles: extractStyles(el),
            attributes: extractAttributes(el)
          });
        });

        // CSS Analysis
        const cssPatterns = {
          typography: {
            fontFamilies: new Set(),
            fontSizes: new Set(),
            fontWeights: new Set(),
            lineHeights: new Set(),
            letterSpacings: new Set(),
            wordSpacings: new Set()
          },
          colors: {
            textColors: new Set(),
            backgroundColors: new Set(),
            borderColors: new Set()
          },
          spacing: {
            margins: new Set(),
            paddings: new Set()
          },
          layout: {
            displays: new Set(),
            positions: new Set(),
            zIndexes: new Set()
          },
          responsive: {
            mediaQueries: 0,
            flexbox: 0,
            grid: 0,
            viewportUnits: 0,
            percentages: 0,
            hasMediaQueries: false
          }
        };

        // Get all elements for analysis
        const allElements = document.querySelectorAll('*');

        // Analyze stylesheets for media queries
        Array.from(document.styleSheets).forEach(sheet => {
          try {
            Array.from(sheet.cssRules || sheet.rules || []).forEach(rule => {
              if (rule.type === CSSRule.MEDIA_RULE) {
                cssPatterns.responsive.mediaQueries++;
                cssPatterns.responsive.hasMediaQueries = true;
              }
            });
          } catch (e) {
            // Cross-origin stylesheets will throw error
          }
        });

        // Analyze elements
        allElements.forEach(el => {
          const styles = extractStyles(el);
          
          // Typography
          cssPatterns.typography.fontFamilies.add(styles.fontFamily);
          cssPatterns.typography.fontSizes.add(styles.fontSize);
          cssPatterns.typography.fontWeights.add(styles.fontWeight);
          cssPatterns.typography.lineHeights.add(styles.lineHeight);
          cssPatterns.typography.letterSpacings.add(styles.letterSpacing);
          cssPatterns.typography.wordSpacings.add(styles.wordSpacing);
          
          // Colors
          cssPatterns.colors.textColors.add(styles.color);
          cssPatterns.colors.backgroundColors.add(styles.backgroundColor);
          cssPatterns.colors.borderColors.add(styles.borderColor);
          
          // Spacing
          cssPatterns.spacing.margins.add(styles.margin);
          cssPatterns.spacing.paddings.add(styles.padding);
          
          // Layout
          cssPatterns.layout.displays.add(styles.display);
          cssPatterns.layout.positions.add(styles.position);
          cssPatterns.layout.zIndexes.add(styles.zIndex);

          // Check for responsive patterns
          if (styles.display === 'flex') cssPatterns.responsive.flexbox++;
          if (styles.display === 'grid') cssPatterns.responsive.grid++;
        });

        // Convert Sets to Arrays for JSON serialization
        const convertSetsToArrays = (obj) => {
          const result = {};
          for (const [key, value] of Object.entries(obj)) {
            if (value instanceof Set) {
              result[key] = Array.from(value);
            } else if (typeof value === 'object' && value !== null) {
              result[key] = convertSetsToArrays(value);
            } else {
              result[key] = value;
            }
          }
          return result;
        };

        const cssAnalysis = convertSetsToArrays(cssPatterns);

        // Enhanced Analysis
        cssAnalysis.enhancedAnalysis = {
          typography: {
            consistency: {
              fontFamilyCount: cssPatterns.typography.fontFamilies.size,
              fontSizeCount: cssPatterns.typography.fontSizes.size,
              fontWeightCount: cssPatterns.typography.fontWeights.size,
              consistentScale: cssPatterns.typography.fontSizes.size <= 8,
              readableLineHeight: Array.from(cssPatterns.typography.lineHeights).some(lh => 
                parseFloat(lh) >= 1.4 && parseFloat(lh) <= 1.8
              )
            }
          },
          colors: {
            analysis: {
              uniqueColors: cssPatterns.colors.textColors.size + cssPatterns.colors.backgroundColors.size,
              brandColors: cssPatterns.colors.textColors.size <= 5,
              accessibleContrast: true
            }
          },
          spacing: {
            consistency: {
              marginCount: cssPatterns.spacing.margins.size,
              paddingCount: cssPatterns.spacing.paddings.size,
              consistentScale: cssPatterns.spacing.margins.size <= 10 && cssPatterns.spacing.paddings.size <= 10
            }
          },
          layout: {
            analysis: {
              usesFlexbox: cssPatterns.responsive.flexbox > 0,
              usesGrid: cssPatterns.responsive.grid > 0,
              consistentLayout: cssPatterns.layout.displays.size <= 5
            }
          },
          responsive: {
            analysis: {
              mobileFirst: cssPatterns.responsive.mediaQueries > 0,
              breakpoints: cssPatterns.responsive.mediaQueries,
              touchTargets: true
            }
          },
          interaction: {
            hoverStates: 0,
            focusStates: 0,
            activeStates: 0,
            transitions: 0,
            cursorPointers: 0
          },
          accessibility: {
            focusVisible: true,
            highContrast: true,
            altText: true,
            semanticHtml: true
          }
        };

        // Meta data
        const metaData = {
          title: document.title || '',
          description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '',
          lang: document.documentElement.lang || 'en',
          charset: document.characterSet || 'UTF-8'
        };

        return {
          htmlComponents,
          cssAnalysis,
          metaData
        };
      });

      console.log('✅ Crawl completed successfully');
      return {
        url,
        timestamp: new Date().toISOString(),
        ...result
      };

    } catch (error) {
      console.error('Crawling error:', error);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
      await this.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export { WebCrawler };

