import { chromium } from 'playwright';

export default async function simpleCrawl(url) {
  let browser = null;
  let page = null;
  
  try {
    console.log('Starting crawl for:', url);
    
    // Launch browser
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('Browser launched');
    
    // Create page
    page = await browser.newPage();
    console.log('Page created');
    
    // Navigate to URL
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    console.log('Page loaded');

    // Extract basic data
    const title = await page.title();
    const html = await page.content();
    
    console.log('Data extracted');

    return {
      title,
      html: html.substring(0, 10000), // Limit size
      url,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Simple crawl error:', error);
    throw new Error(`Failed to crawl: ${error.message}`);
  } finally {
    // Clean up
    if (page) {
      await page.close().catch(() => {});
    }
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
