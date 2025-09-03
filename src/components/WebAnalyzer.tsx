import React, { useState } from 'react';
import { Globe, Loader2, AlertCircle } from 'lucide-react';

interface CrawlResult {
  success: boolean;
  htmlElements?: any;
  cssAnalysis?: any;
  metaData?: {
    title: string;
    description: string;
    keywords: string;
    url: string;
  };
  error?: string;
  timestamp: string;
}



export default function WebAnalyzer() {
  const [url, setUrl] = useState('');
  const [userId, setUserId] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [error, setError] = useState('');


  const generateUserId = () => {
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(newUserId);
    return newUserId;
  };

  const crawlWebsite = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: url.trim()
        })
      });

      // Check if response is ok first
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Crawling failed';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Parse JSON response
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid response format from server');
      }

      setResult(data);

    } catch (error: any) {
      console.error('Crawling error:', error);
      setError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };



  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Website Analyzer
        </h1>
        <p className="text-muted-foreground">
          Test website crawling - Extract HTML and CSS
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-card rounded-lg border p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Website URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isAnalyzing}
              />
              <button
                onClick={crawlWebsite}
                disabled={isAnalyzing || !url.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Crawling...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    Crawl Website
                  </>
                )}
              </button>
            </div>
          </div>


        </div>

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>



      {/* Results */}
      {result && (
        <div className="bg-card rounded-lg border p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Crawl Results</h3>
            <div className="text-sm text-muted-foreground">
              Crawled on {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>

          {result.success ? (
            <>
              {/* Meta Data */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Website Information</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Title:</strong> {result.metaData?.title || 'N/A'}</div>
                  <div><strong>URL:</strong> {result.metaData?.url || 'N/A'}</div>
                  <div><strong>Description:</strong> {result.metaData?.description || 'N/A'}</div>
                  {result.metaData?.keywords && (
                    <div><strong>Keywords:</strong> {result.metaData.keywords}</div>
                  )}
                </div>
              </div>

              {/* HTML Elements */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">HTML Elements (Theo list yêu cầu)</h4>
                <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap break-words">
                    {JSON.stringify(result.htmlElements, null, 2)}
                  </pre>
                </div>
              </div>

              {/* CSS Analysis */}
              <div>
                <h4 className="font-medium mb-3">CSS Analysis (UX/UI Categories)</h4>
                <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap break-words">
                    {JSON.stringify(result.cssAnalysis, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              <strong>Error:</strong> {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
