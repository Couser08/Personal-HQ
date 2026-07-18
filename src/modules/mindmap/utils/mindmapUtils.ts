import React from 'react';
import { type MindmapNode, type MindmapLink } from '../../../store/types';

export const COLOR_PRESETS = [
  { id: 'rose', label: 'Pink', bg: 'bg-rose-500/[0.04] border-rose-500/20 text-rose-600 dark:bg-rose-950/20 dark:border-rose-800/40 dark:text-rose-400 hover:bg-rose-500/[0.08] hover:border-rose-500/30' },
  { id: 'amber', label: 'Orange', bg: 'bg-amber-500/[0.04] border-amber-500/20 text-amber-600 dark:bg-amber-950/20 dark:border-amber-800/40 dark:text-amber-400 hover:bg-amber-500/[0.08] hover:border-amber-500/30' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-500/[0.04] border-purple-500/20 text-purple-600 dark:bg-purple-950/20 dark:border-purple-800/40 dark:text-purple-400 hover:bg-purple-500/[0.08] hover:border-purple-500/30' },
  { id: 'green', label: 'Green', bg: 'bg-emerald-500/[0.04] border-emerald-500/20 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-400 hover:bg-emerald-500/[0.08] hover:border-emerald-500/30' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-500/[0.04] border-blue-500/20 text-blue-600 dark:bg-blue-950/20 dark:border-blue-800/40 dark:text-blue-400 hover:bg-blue-500/[0.08] hover:border-blue-500/30' },
  { id: 'gray', label: 'Gray', bg: 'bg-surface border-border text-text-primary hover:bg-surface-alt' }
] as const;

export type MindmapColor = NonNullable<MindmapNode['color']>;

export const getDomainName = (urlStr: string) => {
  try {
    const u = urlStr.startsWith('http') ? urlStr : 'https://' + urlStr;
    return new URL(u).hostname.replace('www.', '');
  } catch {
    return urlStr;
  }
};

export const getDomainFavicon = (urlStr: string) => {
  try {
    const domain = new URL(urlStr).hostname.toLowerCase();
    if (
      domain.includes('localhost') ||
      domain.includes('127.0.0.1') ||
      domain.includes('lovable.app') ||
      domain.includes('vercel.app') ||
      domain.includes('netlify.app') ||
      domain.includes('github.dev') ||
      domain.includes('preview') ||
      !domain.includes('.')
    ) {
      return '';
    }
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
};

export const sanitizeMindmapNodes = (nodes: MindmapNode[], links: MindmapLink[]): MindmapNode[] => {
  const root = nodes.find(n => n.isRoot) || nodes[0];
  if (!root) return nodes;

  const nodeMap = new Map<string, MindmapNode>(nodes.map(n => [n.id, { ...n }]));
  const visited = new Set<string>();
  const queue: { id: string; parentId?: string; side?: 'left' | 'right' | 'bottom' }[] = [{ id: root.id }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    const node = nodeMap.get(current.id);
    if (node) {
      if (!node.isRoot) {
        if (current.parentId && !node.parentId) node.parentId = current.parentId;
        if (current.side && !node.side) node.side = current.side;
      }
    }

    const connectedLinks = links.filter(l => l.source === current.id || l.target === current.id);
    connectedLinks.forEach(link => {
      const neighborId = link.source === current.id ? link.target : link.source;
      if (!visited.has(neighborId)) {
        let side = current.side;
        if (current.id === root.id) {
          const neighbor = nodes.find(n => n.id === neighborId);
          if (neighbor) {
            if (neighbor.x < root.x - 50) side = 'left';
            else if (neighbor.x > root.x + 50) side = 'right';
            else side = 'bottom';
          }
        }
        queue.push({ id: neighborId, parentId: current.id, side });
      }
    });
  }

  return Array.from(nodeMap.values());
};

export function renderInlineMarkdown(text: string): React.ReactNode[] {
  let parts: Array<{ type: 'text' | 'bold' | 'italic' | 'code' | 'link'; content: string; url?: string }> = [
    { type: 'text', content: text }
  ];

  const splitParts = (
    regex: RegExp, 
    type: 'bold' | 'italic' | 'code' | 'link',
    processMatch: (match: RegExpExecArray) => { content: string; url?: string }
  ) => {
    let newParts: typeof parts = [];
    for (const part of parts) {
      if (part.type !== 'text') {
        newParts.push(part);
        continue;
      }

      let lastIndex = 0;
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(part.content)) !== null) {
        if (match.index > lastIndex) {
          newParts.push({ type: 'text', content: part.content.substring(lastIndex, match.index) });
        }
        const processed = processMatch(match);
        newParts.push({ type, ...processed });
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < part.content.length) {
        newParts.push({ type: 'text', content: part.content.substring(lastIndex) });
      }
    }
    parts = newParts;
  };

  splitParts(/`([^`]+)`/g, 'code', (m) => ({ content: m[1] }));
  splitParts(/\[([^\]]+)\]\(([^)]+)\)/g, 'link', (m) => ({ content: m[1], url: m[2] }));
  splitParts(/\*\*([^*]+)\*\*/g, 'bold', (m) => ({ content: m[1] }));
  splitParts(/\*([^*]+)\*/g, 'italic', (m) => ({ content: m[1] }));

  return parts.map((part, idx) => {
    switch (part.type) {
      case 'bold':
        return React.createElement('strong', { key: idx, className: 'font-extrabold text-stone-900 dark:text-white' }, part.content);
      case 'italic':
        return React.createElement('em', { key: idx, className: 'italic text-stone-700 dark:text-stone-300' }, part.content);
      case 'code':
        return React.createElement('code', { key: idx, className: 'bg-stone-100 dark:bg-stone-900 px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold border border-stone-200/50 dark:border-stone-850' }, part.content);
      case 'link':
        return React.createElement('a', { key: idx, href: part.url, target: '_blank', rel: 'noopener noreferrer', className: 'text-amber-650 dark:text-amber-450 hover:underline font-bold inline-flex items-center gap-0.5' }, part.content);
      default:
        return React.createElement('span', { key: idx }, part.content);
    }
  });
}

export function renderMarkdown(md: string): React.ReactNode {
  if (!md) return null;

  const rawBlocks = md.split(/\n\n+/);
  const blocks: string[] = [];

  rawBlocks.forEach(b => {
    const trimmed = b.trim();
    if (trimmed.startsWith('```')) {
      blocks.push(b);
    } else if (trimmed.startsWith('|')) {
      blocks.push(b);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s+/.test(trimmed)) {
      blocks.push(b);
    } else {
      blocks.push(b);
    }
  });

  return React.createElement(
    'div',
    { className: 'space-y-4' },
    blocks.map((block, bIdx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('```')) {
        const lines = trimmed.split('\n');
        const code = lines.slice(1, lines.length - (lines[lines.length - 1].trim() === '```' ? 1 : 0)).join('\n');
        return React.createElement(
          'pre',
          { key: bIdx, className: 'bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 overflow-x-auto text-[11px] font-mono text-stone-800 dark:text-stone-300 leading-relaxed my-2 shadow-inner' },
          React.createElement('code', {}, code)
        );
      }

      if (trimmed.startsWith('|')) {
        const lines = trimmed.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
        if (lines.length > 0) {
          const hasSeparator = lines[1] && lines[1].replace(/[\s\-\|]/g, '') === '';
          const dataLines = hasSeparator ? [lines[0], ...lines.slice(2)] : lines;

          const parseRow = (rowStr: string) => {
            return rowStr.split('|').slice(1, -1).map(c => c.trim());
          };

          const headerCells = parseRow(dataLines[0]);
          const bodyRows = dataLines.slice(1).map(parseRow);

          return React.createElement(
            'div',
            { key: bIdx, className: 'overflow-x-auto my-3 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm bg-white dark:bg-stone-950' },
            React.createElement(
              'table',
              { className: 'w-full text-left border-collapse text-xs' },
              React.createElement(
                'thead',
                {},
                React.createElement(
                  'tr',
                  { className: 'bg-stone-100 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800' },
                  headerCells.map((cell, cIdx) =>
                    React.createElement(
                      'th',
                      { key: cIdx, className: 'px-4 py-2.5 font-bold text-stone-700 dark:text-stone-300 border-r border-stone-200/50 last:border-0' },
                      renderInlineMarkdown(cell)
                    )
                  )
                )
              ),
              React.createElement(
                'tbody',
                { className: 'divide-y divide-stone-200/60 dark:divide-stone-800/60' },
                bodyRows.map((row, rIdx) =>
                  React.createElement(
                    'tr',
                    { key: rIdx, className: 'hover:bg-stone-50/50 dark:hover:bg-stone-900/50 transition-colors' },
                    row.map((cell, cIdx) =>
                      React.createElement(
                        'td',
                        { key: cIdx, className: 'px-4 py-2.5 text-stone-600 dark:text-stone-400 font-medium leading-relaxed border-r border-stone-200/40 dark:border-stone-800/40 last:border-0' },
                        renderInlineMarkdown(cell)
                      )
                    )
                  )
                )
              )
            )
          );
        }
      }

      if (trimmed.startsWith('#')) {
        const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2];
          const content = renderInlineMarkdown(text);
          if (level === 1) return React.createElement('h1', { key: bIdx, className: 'text-xl font-black text-stone-800 dark:text-stone-100 tracking-tight mt-6 mb-2 border-b border-stone-200 dark:border-stone-800 pb-2' }, content);
          if (level === 2) return React.createElement('h2', { key: bIdx, className: 'text-lg font-extrabold text-stone-800 dark:text-stone-200 tracking-tight mt-5 mb-2' }, content);
          if (level === 3) return React.createElement('h3', { key: bIdx, className: 'text-base font-bold text-stone-750 dark:text-stone-205 mt-4 mb-1.5' }, content);
          return React.createElement('h4', { key: bIdx, className: 'text-sm font-bold text-stone-600 dark:text-stone-400 mt-3 mb-1' }, content);
        }
      }

      if (trimmed.startsWith('>')) {
        const lines = trimmed.split('\n').map(l => l.replace(/^>\s?/, ''));
        return React.createElement(
          'blockquote',
          { key: bIdx, className: 'border-l-4 border-amber-500 bg-amber-500/5 dark:bg-amber-500/2 rounded-r-xl px-4 py-3 text-xs italic text-stone-600 dark:text-stone-400 my-3 leading-relaxed' },
          renderMarkdown(lines.join('\n\n'))
        );
      }

      const listLines = trimmed.split('\n');
      const isBulletList = listLines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('* ') || l.trim().startsWith('• '));
      const isOrderedList = listLines.every(l => /^\d+\.\s+/.test(l.trim()));

      if (isBulletList) {
        return React.createElement(
          'ul',
          { key: bIdx, className: 'list-disc pl-5 space-y-1.5 text-xs text-stone-600 dark:text-stone-400 my-3' },
          listLines.map((line, lIdx) =>
            React.createElement(
              'li',
              { key: lIdx, className: 'font-medium leading-relaxed' },
              renderInlineMarkdown(line.trim().replace(/^[-*•]\s+/, ''))
            )
          )
        );
      }

      if (isOrderedList) {
        return React.createElement(
          'ol',
          { key: bIdx, className: 'list-decimal pl-5 space-y-1.5 text-xs text-stone-600 dark:text-stone-400 my-3' },
          listLines.map((line, lIdx) =>
            React.createElement(
              'li',
              { key: lIdx, className: 'font-medium leading-relaxed' },
              renderInlineMarkdown(line.trim().replace(/^\d+\.\s+/, ''))
            )
          )
        );
      }

      const lines = trimmed.split('\n');
      return React.createElement(
        'p',
        { key: bIdx, className: 'text-xs text-stone-650 dark:text-stone-350 font-medium leading-relaxed mb-3' },
        lines.map((line, lIdx) =>
          React.createElement('span', { key: lIdx, className: 'block' }, renderInlineMarkdown(line))
        )
      );
    })
  );
}
