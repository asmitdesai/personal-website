'use client';

import { useRef, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = ref.current?.innerText ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <div className="code-block group relative">
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code to clipboard"
        className="copy-button"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre ref={ref} {...props}>
        {children}
      </pre>
    </div>
  );
}

export function Markdown({ body }: { body: string }) {
  return (
    <ReactMarkdown rehypePlugins={[rehypeHighlight]} components={{ pre: CodeBlock }}>
      {body}
    </ReactMarkdown>
  );
}
