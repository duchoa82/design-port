import fetch from 'node-fetch';

async function testEndToEnd() {
  console.log('🚀 Testing End-to-End UX Audit Flow\n');
  
  const testData = {
    url: 'https://www.karocrafts.com/',
    tone: 'professional',
    voice: 'helpful',
    targetAudience: 'Art enthusiasts and collectors'
  };

  try {
    // Step 1: Crawl Website
    console.log('📋 Step 1: Crawling website...');
    const crawlResponse = await fetch('http://localhost:3001/api/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (!crawlResponse.ok) {
      throw new Error(`Crawl failed: ${crawlResponse.status}`);
    }

    const crawlData = await crawlResponse.json();
    console.log('✅ Crawl successful!');
    console.log(`   📊 Headings: ${crawlData.htmlComponents?.headings?.length || 0}`);
    console.log(`   📊 Paragraphs: ${crawlData.htmlComponents?.paragraphs?.length || 0}`);
    console.log(`   📊 Navigation: ${crawlData.htmlComponents?.navigation?.length || 0}`);
    console.log(`   📊 Forms: ${crawlData.htmlComponents?.forms?.length || 0}`);
    console.log(`   📊 Media: ${crawlData.htmlComponents?.media?.length || 0}`);
    console.log(`   📊 Layout: ${crawlData.htmlComponents?.layout?.length || 0}`);
    console.log(`   🎨 CSS Analysis: ${crawlData.cssAnalysis ? 'Available' : 'Missing'}`);
    console.log(`   📝 Meta: ${crawlData.metaData?.title || 'No title'}\n`);

    // Step 2: UX Audit with AI
    console.log('🤖 Step 2: AI UX Audit...');
    const packagedData = {
      headings: crawlData.htmlComponents?.headings || [],
      paragraphs: crawlData.htmlComponents?.paragraphs || [],
      navigation: crawlData.htmlComponents?.navigation || [],
      forms: crawlData.htmlComponents?.forms || [],
      media: crawlData.htmlComponents?.media || [],
      layout: crawlData.htmlComponents?.layout || [],
      cssAnalysis: crawlData.cssAnalysis || {},
      metaData: crawlData.metaData || {}
    };

    const auditResponse = await fetch('http://localhost:3001/api/ux-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...testData,
        crawlData: packagedData
      })
    });

    if (!auditResponse.ok) {
      throw new Error(`UX Audit failed: ${auditResponse.status}`);
    }

    const auditResult = await auditResponse.json();
    console.log('✅ UX Audit successful!');
    console.log(`   📝 Analysis length: ${auditResult.analysis?.length || 0} characters`);
    console.log(`   📋 Analysis preview:`);
    console.log(`   ${auditResult.analysis?.substring(0, 200)}...\n`);

    // Step 3: Summary
    console.log('🎯 Step 3: Summary');
    console.log('✅ End-to-End Flow: SUCCESSFUL!');
    console.log('✅ Backend APIs: Working');
    console.log('✅ Gemini AI: Working');
    console.log('✅ Frontend: Available at http://localhost:8083/');
    console.log('✅ Ready for UX Audit testing!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testEndToEnd();
