import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';

interface ShikiHighlighterProps {
  code: string;
  lang: string;
  theme: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ShikiHighlighter({ code, lang, theme, className, style }: ShikiHighlighterProps) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const language = (lang && lang.toLowerCase() !== 'other') ? lang.toLowerCase() : 'javascript';
    
    codeToHtml(code, {
      lang: language,
      theme: theme
    }).then(result => {
      if (isMounted) setHtml(result);
    }).catch(e => {
      console.error('Shiki highlighting failed:', e);
      // Fallback
      if (isMounted) {
        setHtml(`<pre class="shiki" style="padding: 14px; margin: 0;"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
      }
    });
    
    return () => { isMounted = false; };
  }, [code, lang, theme]);

  if (!html) {
    return (
      <div 
        className={`shiki-wrapper ${className || ''}`}
        style={{
          ...style,
          opacity: 0.6,
          transition: 'opacity 0.2s',
          margin: 0,
          overflow: 'hidden'
        }}
      >
        <pre style={{ margin: 0, padding: '14px', fontSize: '12px', background: 'transparent' }}>
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div 
      className={`shiki-wrapper ${className || ''}`}
      style={{
        ...style,
        opacity: 1,
        transition: 'opacity 0.2s',
        margin: 0,
        overflow: 'hidden'
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
