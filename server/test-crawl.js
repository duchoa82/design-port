import { WebCrawler } from './crawler-fixed.js';

async function testCrawl() {
  const crawler = new WebCrawler();
  
  console.log('🔍 Testing crawler with https://www.karocrafts.com/');
  
  try {
    const result = await crawler.crawlWebsite('https://www.karocrafts.com/');
    
    console.log('\n=== CRAWL RESULTS ===');
    console.log('✅ URL:', result.url);
    console.log('✅ Title:', result.metaData?.title);
    console.log('✅ Description:', result.metaData?.description);
    
    console.log('\n=== HTML COMPONENTS ===');
    console.log('📋 Headings:', result.htmlComponents?.headings?.length || 0);
    console.log('📋 Paragraphs:', result.htmlComponents?.paragraphs?.length || 0);
    console.log('📋 Navigation items:', result.htmlComponents?.navigation?.length || 0);
    console.log('📋 Forms:', result.htmlComponents?.forms?.length || 0);
    console.log('📋 Media elements:', result.htmlComponents?.media?.length || 0);
    console.log('📋 Layout elements:', result.htmlComponents?.layout?.length || 0);
    
    console.log('\n=== CSS ANALYSIS ===');
    const css = result.cssAnalysis;
    if (css) {
      console.log('🎨 Font families:', css.fontFamilies?.length || 0);
      console.log('🎨 Font sizes:', css.fontSizes?.length || 0);
      console.log('🎨 Colors:', css.textColors?.length || 0);
      console.log('🎨 Background colors:', css.backgroundColors?.length || 0);
      
      if (css.enhancedAnalysis) {
        console.log('📊 Typography consistency:', css.enhancedAnalysis.typography?.consistency?.fontFamilyCount || 0, 'families');
        console.log('📊 Color analysis:', css.enhancedAnalysis.colors?.analysis?.uniqueColors || 0, 'unique colors');
        console.log('📊 Responsive indicators:', css.enhancedAnalysis.responsive?.analysis?.mobileFirst ? 'Mobile-first' : 'Desktop-first');
      }
    }
    
    console.log('\n=== SAMPLE HTML COMPONENT ===');
    if (result.htmlComponents?.headings?.length > 0) {
      const firstHeading = result.htmlComponents.headings[0];
      console.log('📝 First heading:', {
        tag: firstHeading.tag,
        text: firstHeading.text?.substring(0, 50) + '...',
        hasStyles: !!firstHeading.styles,
        stylesCount: firstHeading.styles ? Object.keys(firstHeading.styles).length : 0
      });
    }
    
    console.log('\n✅ Crawl completed successfully!');
    
  } catch (error) {
    console.error('❌ Crawl failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCrawl();
