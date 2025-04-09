'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={`markdown-content ${className || ''}`}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-3xl font-bold my-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-bold my-4" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl font-bold my-3" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-lg font-bold my-3" {...props} />,
          p: ({ node, ...props }) => <p className="my-4" {...props} />,
          a: ({ node, ...props }) => <a className="text-purple-600 hover:text-purple-800 underline" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-4" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-4" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-purple-500 pl-4 italic my-4 text-gray-700" {...props} />
          ),
          img: ({ node, alt, src, ...props }) => (
            <img 
              src={src} 
              alt={alt} 
              className="my-4 max-w-full rounded-lg" 
              {...props} 
            />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                className="rounded-md my-4"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-100 px-1 rounded text-sm" {...props}>
                {children}
              </code>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-200" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
          tr: ({ node, ...props }) => <tr className="border-b border-gray-200" {...props} />,
          th: ({ node, ...props }) => <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />,
          td: ({ node, ...props }) => <td className="px-6 py-4 whitespace-nowrap" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-8 border-t border-gray-300" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;