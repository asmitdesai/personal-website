'use client';

import { isValidElement, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { codeLanguage } from '@/lib/utils';

function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const language = codeLanguage(
    isValidElement<{ className?: string }>(children) ? children.props.className : undefined,
  );

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
      <div className="code-block-bar">
        <span>{language ?? 'text'}</span>
      </div>
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
