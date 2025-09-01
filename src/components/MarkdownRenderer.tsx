'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <ReactMarkdown
      className={`prose prose-invert max-w-none ${className}`}
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold text-white mb-4 mt-6">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold text-white mb-3 mt-5">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-bold text-white mb-2 mt-4">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-gray-300">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400 my-4">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full divide-y divide-gray-700">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-800">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="bg-gray-900 divide-y divide-gray-700">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr>{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-sm text-gray-300">{children}</td>
        ),
        code({ inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');
          const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
          
          if (!inline && match) {
            return (
              <div className="relative group my-4">
                <div className="absolute top-0 right-0 flex items-center gap-2 p-2">
                  <span className="text-xs text-gray-400">{match[1]}</span>
                  <button
                    onClick={() => copyToClipboard(codeString, codeId)}
                    className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    title="Copy code"
                  >
                    {copiedCode === codeId ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <SyntaxHighlighter
                  style={atomDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    paddingTop: '2.5rem',
                    fontSize: '0.875rem',
                  }}
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          }
          
          return (
            <code className="px-1.5 py-0.5 bg-gray-800 text-purple-300 rounded text-sm" {...props}>
              {children}
            </code>
          );
        },
        hr: () => (
          <hr className="my-6 border-gray-700" />
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-white">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-300">{children}</em>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}