async function testAPI() {
  const testData = {
    url: 'https://www.karocrafts.com/',
    tone: 'professional',
    voice: 'helpful',
    targetAudience: 'Art enthusiasts and collectors'
  };

  console.log('🧪 Testing /api/crawl endpoint...');
  
  try {
    const crawlResponse = await fetch('http://localhost:3001/api/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (crawlResponse.ok) {
      const crawlData = await crawlResponse.json();
      console.log('✅ Crawl API successful');
      console.log('📊 Data summary:', {
        headings: crawlData.htmlComponents?.headings?.length || 0,
        paragraphs: crawlData.htmlComponents?.paragraphs?.length || 0,
        cssAnalysis: !!crawlData.cssAnalysis,
        metaData: !!crawlData.metaData
      });

      // Test UX Audit API
      console.log('\n🧪 Testing /api/ux-audit endpoint...');
      
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

      if (auditResponse.ok) {
        const auditResult = await auditResponse.json();
        console.log('✅ UX Audit API successful');
        console.log('📝 Analysis preview:', auditResult.analysis?.substring(0, 200) + '...');
      } else {
        console.log('❌ UX Audit API failed:', auditResponse.status);
      }

    } else {
      console.log('❌ Crawl API failed:', crawlResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();