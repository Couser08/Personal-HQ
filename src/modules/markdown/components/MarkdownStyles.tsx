import React from 'react';

export const MarkdownStyles: React.FC = () => {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        .md-preview h1 { font-size: 1.8rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; color: var(--color-text-primary); border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 0.6rem; font-family: system-ui, -apple-system, sans-serif; letter-spacing: -0.025em; }
        .dark .md-preview h1 { border-bottom-color: rgba(255,255,255,0.06); }
        .md-preview h2 { font-size: 1.35rem; font-weight: 700; margin-top: 1.6rem; margin-bottom: 0.8rem; color: var(--color-text-primary); border-bottom: 1px solid rgba(0,0,0,0.04); padding-bottom: 0.4rem; font-family: system-ui, -apple-system, sans-serif; letter-spacing: -0.02em; }
        .dark .md-preview h2 { border-bottom-color: rgba(255,255,255,0.04); }
        .md-preview h3 { font-size: 1.1rem; font-weight: 700; margin-top: 1.3rem; margin-bottom: 0.6rem; color: var(--color-text-primary); font-family: system-ui, -apple-system, sans-serif; }
        .md-preview p { line-height: 1.6; margin-bottom: 1rem; color: var(--color-text-secondary); font-size: 13.5px; font-weight: 550; }
        .md-preview ul, .md-preview ol { margin-bottom: 1rem; padding-left: 1.2rem; }
        .md-preview li { margin-bottom: 0.4rem; color: var(--color-text-secondary); font-size: 13px; font-weight: 550; }
        .md-preview blockquote { border-left: 4px solid var(--color-primary); padding-left: 1rem; font-style: italic; color: var(--color-text-muted); margin: 1.2rem 0; font-size: 13px; font-weight: 500; }
        .md-preview :not(pre) > code { font-family: monospace; background: rgba(0,0,0,0.04); padding: 0.15rem 0.35rem; border-radius: 6px; font-size: 0.85em; font-weight: 600; color: #ff2d55; }
        .dark .md-preview :not(pre) > code { background: rgba(255,255,255,0.08); color: #ff3b30; }
        .md-preview table { width: 100%; border-collapse: collapse; margin: 1.75rem 0; font-size: 13px; border-radius: 14px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); background: var(--bg-surface); box-shadow: 0 4px 20px -10px rgba(0,0,0,0.05); }
        .dark .md-preview table { border-color: rgba(255,255,255,0.08); box-shadow: 0 4px 20px -10px rgba(0,0,0,0.3); }
        .md-preview th { background: rgba(0,0,0,0.02); font-weight: 700; color: var(--color-text-primary); padding: 0.85rem 1.1rem; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid rgba(0,0,0,0.06); }
        .dark .md-preview th { background: rgba(255,255,255,0.03); border-bottom-color: rgba(255,255,255,0.1); }
        .md-preview td { padding: 0.85rem 1.1rem; color: var(--color-text-secondary); border-bottom: 1px solid rgba(0,0,0,0.04); transition: background-color 0.15s ease; }
        .dark .md-preview td { border-bottom-color: rgba(255,255,255,0.05); }
        .md-preview tr:last-child td { border-bottom: none; }
        .md-preview tr:hover td { background: rgba(0,0,0,0.015); }
        .dark .md-preview tr:hover td { background: rgba(255,255,255,0.015); }
        .md-code-block { margin: 1.25rem 0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: #0d1117; }
        .md-code-header { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 1rem; background: #161b22; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .md-code-lang { font-family: SFMono-Regular, Consolas, monospace; font-size: 11px; font-weight: 600; color: #8b949e; text-transform: lowercase; letter-spacing: 0.02em; }
        .md-code-copy { display: flex; align-items: center; gap: 5px; font-family: system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: 500; color: #8b949e; background: none; border: none; cursor: pointer; padding: 2px 6px; border-radius: 6px; transition: color 0.15s, background 0.15s; }
        .md-code-copy:hover { color: #e6edf3; background: rgba(255,255,255,0.06); }
        .md-code-pre { margin: 0; padding: 1rem; overflow-x: auto; background: #0d1117; }
        .md-code-pre code { font-family: SFMono-Regular, Consolas, 'Courier New', monospace; font-size: 12.5px; line-height: 1.7; color: #e6edf3; background: transparent; display: block; }
        .code-line { display: block; }
        .code-ln { display: inline-block; min-width: 2.2rem; padding-right: 1rem; color: #3d444d; font-size: 11.5px; user-select: none; text-align: right; }
        .code-lc { color: #e6edf3; white-space: pre; }
      `,
      }}
    />
  );
};
