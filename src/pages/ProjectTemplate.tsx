import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import Header from '@/components/portfolio/Header';
import FooterSection from '@/components/portfolio/FooterSection';
import { useParams } from 'react-router-dom';

export default function ProjectTemplate() {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams();
  
  console.log('Project ID from params:', id);

  useEffect(() => {
    const projectFile = `/project${id}.md`;
    console.log('Fetching project file:', projectFile);
    fetch(projectFile)
      .then(res => {
        console.log('Response status:', res.status);
        if (!res.ok) throw new Error(`Failed to load ${projectFile}`);
        return res.text();
      })
      .then(text => {
        console.log('Loaded markdown:', text.slice(0, 200));
        setContent(text);
      })
      .catch(e => {
        console.error('Error loading project:', e);
        setError(e.message);
      });
  }, [id]);

  if (error) return <div className="text-red-600">{error}</div>;
  if (!content) return <div>Loading...</div>;

  // Extract the first H1 from the markdown content
  const h1Match = content.match(/^#\s+(.+)$/m);
  const h1 = h1Match ? h1Match[1] : null;
  const restContent = h1Match ? content.replace(/^#\s+(.+)$/m, '').trim() : content;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-3xl mx-auto py-12 px-4">
        {h1 && <h1 className="text-4xl font-bold mb-6">{h1}</h1>}
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {restContent}
          </ReactMarkdown>
        </div>
      </div>
      <FooterSection />
    </div>
  );
}