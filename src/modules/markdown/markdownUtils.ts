// Helper to parse Markdown tables
export const parseTables = (text: string): string => {
  const lines = text.split(/\r?\n/);
  let inTable = false;
  let tableLines: string[] = [];
  const resultLines: string[] = [];

  const renderHtmlTable = (rows: string[]): string => {
    if (rows.length === 0) return '';
    
    // Filter out separator rows like |---| or | :--- |
    const cleanRows = rows.filter(r => {
      const content = r.replace(/[|:\s-]/g, '');
      return content.length > 0;
    });

    if (cleanRows.length === 0) return '';

    let html = '<div class="overflow-x-auto my-6"><table class="min-w-full border-collapse border border-border/60 text-left text-sm rounded-xl overflow-hidden">';
    
    // Header
    const headers = cleanRows[0]
      .split('|')
      .slice(1, -1)
      .map(h => h.trim());
      
    html += '<thead class="bg-surface-alt border-b border-border/80"><tr>';
    headers.forEach(h => {
      html += `<th class="px-4 py-3 font-bold text-text-primary border-r border-border/40 last:border-r-0">${h}</th>`;
    });
    html += '</tr></thead>';

    // Body
    html += '<tbody class="divide-y divide-border/30">';
    for (let rIdx = 1; rIdx < cleanRows.length; rIdx++) {
      const cells = cleanRows[rIdx]
        .split('|')
        .slice(1, -1)
        .map(c => c.trim());
      
      html += '<tr class="hover:bg-surface-alt/25 transition-colors">';
      cells.forEach(c => {
        html += `<td class="px-4 py-3 text-text-secondary border-r border-border/35 last:border-r-0">${c}</td>`;
      });
      html += '</tr>';
    }
    html += '</tbody></table></div>';
    return html;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isTableRow = line.startsWith('|') && line.endsWith('|');

    if (isTableRow) {
      if (!inTable) {
        inTable = true;
        tableLines = [];
      }
      tableLines.push(line);
    } else {
      if (inTable) {
        resultLines.push(renderHtmlTable(tableLines));
        inTable = false;
      }
      resultLines.push(lines[i]);
    }
  }
  if (inTable) {
    resultLines.push(renderHtmlTable(tableLines));
  }
  return resultLines.join('\n');
};

// Custom regex-based Markdown to HTML parser
export const parseMarkdown = (md: string): string => {
  if (!md) return '<p class="text-text-muted italic">No content written yet. Select a template or write markdown to begin.</p>';
  
  // 1. Extract code blocks first to protect them from HTML escaping
  const codeBlocks: string[] = [];
  let html = md.replace(/[ \t]*```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)\r?\n[ \t]*```/g, (_, lang, code) => {
    // Escape HTML inside code safely
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const lines = escapedCode.split('\n');
    const numberedLines = lines.map((l: string, i: number) =>
      `<span class="code-line"><span class="code-ln">${i + 1}</span><span class="code-lc">${l}</span></span>`
    ).join('\n');
    const langLabel = lang || 'text';
    const copyId = `cb-${Math.random().toString(36).slice(2,8)}`;
    const svgCopy = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    codeBlocks.push(
      `<div class="md-code-block" id="${copyId}">`
      + `<div class="md-code-header"><span class="md-code-lang">${langLabel}</span>`
      + `<button class="md-code-copy" onclick="(function(btn){const code=btn.closest('.md-code-block').querySelector('code').innerText;navigator.clipboard.writeText(code).then(()=>{btn.querySelector('.md-copy-label').textContent='Copied!';setTimeout(()=>btn.querySelector('.md-copy-label').textContent='Copy',2000)}).catch(()=>{})})(this)">${svgCopy}<span class="md-copy-label">Copy</span></button>`
      + `</div>`
      + `<pre class="md-code-pre"><code>${numberedLines}</code></pre>`
      + `</div>`
    );
    return `__CODEBLOCK_${codeBlocks.length - 1}__`;
  });

  // 2. Escape remaining HTML entities
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // Parse tables
  html = parseTables(html);
    
  // 3. Headers
  html = html.replace(/^###### (.*?)$/gm, '<h6 class="text-xs font-black text-text-primary uppercase tracking-wider mt-4 mb-2">$1</h6>');
  html = html.replace(/^##### (.*?)$/gm, '<h5 class="text-sm font-extrabold text-text-primary mt-5 mb-2">$1</h5>');
  html = html.replace(/^#### (.*?)$/gm, '<h4 class="text-base font-black text-text-primary tracking-tight mt-6 mb-2">$1</h4>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-black text-text-primary tracking-tight mt-7 mb-2">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-black text-text-primary tracking-tight mt-8 mb-3 pb-1 border-b border-border/30">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-black text-text-primary tracking-tight mt-10 mb-4 pb-2 border-b border-border/50">$1</h1>');
  
  // 4. Alert boxes (GitHub style)
  html = html.replace(/^&gt;\s*\[!NOTE\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-blue-500/10 border-l-4 border-blue-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Note</p>$1</div>');
  html = html.replace(/^&gt;\s*\[!TIP\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-emerald-500/10 border-l-4 border-emerald-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">Tip</p>$1</div>');
  html = html.replace(/^&gt;\s*\[!IMPORTANT\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-purple-500/10 border-l-4 border-purple-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-purple-500 mb-1">Important</p>$1</div>');
  html = html.replace(/^&gt;\s*\[!WARNING\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">Warning</p>$1</div>');
  html = html.replace(/^&gt;\s*\[!CAUTION\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-rose-500/10 border-l-4 border-rose-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1">Caution</p>$1</div>');
  
  // Standard blockquotes
  html = html.replace(/^&gt;\s*(.*?)$/gm, '<blockquote class="border-l-4 border-border/80 pl-4 py-1 italic text-text-secondary my-4">$1</blockquote>');

  // 5. Horizontal lines (---)
  html = html.replace(/^---$/gm, '<hr class="my-6 border-border/40" />');

  // 5. Checklist items
  html = html.replace(/^- \[(x|X)\] (.*?)$/gm, '<div class="flex items-center gap-2 text-text-primary my-1.5"><input type="checkbox" checked disabled class="accent-primary rounded" /><span>$2</span></div>');
  html = html.replace(/^- \[\s\] (.*?)$/gm, '<div class="flex items-center gap-2 text-text-secondary my-1.5"><input type="checkbox" disabled class="rounded" /><span>$2</span></div>');

  // 6. Bullet points
  html = html.replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc pl-1 text-text-secondary my-1">$1</li>');

  // 7. Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/__((?!_)[^_]+(?!_))__/g, '<u>$1</u>');

  // 8. Inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-surface-alt text-primary font-mono text-[11px] px-1.5 py-0.5 rounded border border-border/40">$1</code>');

  // 9. Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold">$1</a>');

  // Parse double newline paragraph breaks
  const paragraphs = html.split(/\n{2,}/);
  const formatted = paragraphs.map(p => {
    const trimmed = p.trim();
    if (
      trimmed.startsWith('<h') ||
      trimmed.startsWith('<blockquote') ||
      trimmed.startsWith('<pre') ||
      trimmed.startsWith('<hr') ||
      trimmed.startsWith('<div') ||
      trimmed.startsWith('<li') ||
      /^__CODEBLOCK_\d+__$/.test(trimmed)
    ) {
      return p;
    }
    return `<p class="my-3 text-sm leading-relaxed text-text-secondary">${p}</p>`;
  });
  
  let result = formatted.join('\n');
  
  // Restore code blocks after all other processing
  codeBlocks.forEach((block, i) => {
    result = result.replace(`__CODEBLOCK_${i}__`, block);
  });
  
  return result;
};
