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
    const getShikiLang = (l: string) => {
      const clean = l.trim().toLowerCase();
      if (clean === 'c++') return 'cpp';
      if (clean === 'c#') return 'csharp';
      if (clean === 'js') return 'javascript';
      if (clean === 'ts') return 'typescript';
      if (clean === 'py') return 'python';
      if (clean === 'bash' || clean === 'sh') return 'shellscript';
      if (clean === 'other' || !clean) return 'javascript';
      return clean;
    };

    const language = getShikiLang(lang);
    
    codeToHtml(code, {
      lang: language,
      theme: theme
    }).then(result => {
      if (isMounted) setHtml(result);
    }).catch(e => {
      console.error('Shiki highlighting failed:', e);
      // Fallback with explicit premium code styles so it never renders in default blue/black
      if (isMounted) {
        setHtml(`<pre class="shiki" style="padding: 16px; margin: 0; font-family: monospace; font-size: 13px; line-height: 1.6; color: #e1e4e8; background-color: #24292e;"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
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
