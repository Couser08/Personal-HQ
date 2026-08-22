export const HIGHLIGHT_COLORS = [
  { hex: '#fef08a', label: 'Yellow' },
  { hex: '#bbf7d0', label: 'Green' },
  { hex: '#bfdbfe', label: 'Blue' },
  { hex: '#fbcfe8', label: 'Pink' },
  { hex: '#fed7aa', label: 'Orange' },
  { hex: '#ddd6fe', label: 'Purple' },
  { hex: '#fecdd3', label: 'Red' },
  { hex: '#cffafe', label: 'Cyan' },
  { hex: '#ccfbf1', label: 'Teal' },
  { hex: '#d9f99d', label: 'Lime' },
];

export const LANG_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'other', label: 'Other' },
];

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function detectLanguage(code: string): string {
  const trimmed = code.trim();
  if (
    trimmed.startsWith('<?php') ||
    trimmed.includes('<?php') ||
    (trimmed.includes('namespace ') && trimmed.includes('$this->'))
  ) {
    return 'php';
  }
  if (
    trimmed.startsWith('import ') &&
    (trimmed.includes("from 'react'") || trimmed.includes('from "react"'))
  ) {
    return 'typescript';
  }
  if (trimmed.startsWith('def ') && trimmed.includes(':')) {
    return 'python';
  }
  if (trimmed.startsWith('public class ') || trimmed.includes('System.out.println')) {
    return 'java';
  }
  if (
    trimmed.includes('using System;') ||
    (trimmed.includes('namespace ') &&
      trimmed.includes('class ') &&
      trimmed.includes('void Main'))
  ) {
    return 'csharp';
  }
  if (
    trimmed.startsWith('package ') &&
    (trimmed.includes('import "fmt"') || trimmed.includes('func main()'))
  ) {
    return 'go';
  }
  if (trimmed.includes('fn main()') || trimmed.includes('let mut ')) {
    return 'rust';
  }
  if (
    trimmed.startsWith('select ') ||
    trimmed.startsWith('SELECT ') ||
    trimmed.includes('INSERT INTO ') ||
    trimmed.includes('CREATE TABLE ')
  ) {
    return 'sql';
  }
  if (trimmed.startsWith('<html') || trimmed.startsWith('<!DOCTYPE html>')) {
    return 'html';
  }
  if (
    trimmed.includes('{') &&
    trimmed.includes(':') &&
    (trimmed.includes('margin:') || trimmed.includes('padding:') || trimmed.includes('color:'))
  ) {
    if (
      trimmed.includes('body {') ||
      trimmed.includes('.class {') ||
      trimmed.includes('#id {')
    ) {
      return 'css';
    }
  }
  if (
    trimmed.startsWith('{') &&
    trimmed.endsWith('}') &&
    (trimmed.includes('":') || trimmed.includes('": '))
  ) {
    return 'json';
  }
  return 'other';
}

export async function highlightAllCodeBlocksInHtml(
  html: string,
  isDark: boolean,
): Promise<string> {
  if (typeof window === 'undefined' || !html) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const theme = isDark ? 'github-dark' : 'snazzy-light';

  const codeBlocks = doc.querySelectorAll<HTMLElement>('.note-code-block');
  const plainPreCodes = doc.querySelectorAll('pre code');

  if (codeBlocks.length === 0 && plainPreCodes.length === 0) {
    return html;
  }

  const { codeToHtml } = await import('shiki');

  for (const block of Array.from(codeBlocks)) {
    const lang = block.getAttribute('data-language') || 'javascript';
    const encoded = block.getAttribute('data-code') || '';

    const codeElem = block.querySelector('.note-code-pre code');
    if (!codeElem) continue;

    let code = '';
    try {
      code = encoded ? decodeURIComponent(encoded) : codeElem.textContent || '';
    } catch {
      code = codeElem.textContent || '';
    }

    if (!code) continue;

    try {
      const language =
        lang && lang.toLowerCase() !== 'other' ? lang.toLowerCase() : 'javascript';
      const highlighted = await codeToHtml(code, { lang: language, theme });
      const tempDoc = parser.parseFromString(highlighted, 'text/html');
      const shikiCode = tempDoc.querySelector('code');
      if (shikiCode) {
        codeElem.innerHTML = shikiCode.innerHTML;
      } else {
        codeElem.innerHTML = escapeHtml(code);
      }
    } catch (e) {
      console.error('Shiki error:', e);
      codeElem.innerHTML = escapeHtml(code);
    }
  }

  for (const codeElem of Array.from(plainPreCodes)) {
    if (codeElem.closest('.note-code-block')) continue;

    const preElem = codeElem.parentElement;
    if (!preElem) continue;

    let lang = 'javascript';
    const classList = Array.from(codeElem.classList).concat(Array.from(preElem.classList));
    const langClass = classList.find((c) => c.startsWith('language-') || c.startsWith('lang-'));
    if (langClass) {
      lang = langClass.replace(/^(language-|lang-)/, '');
    } else {
      lang = detectLanguage(codeElem.textContent || '');
    }

    const codeText = codeElem.textContent || '';
    if (codeText) {
      try {
        const language =
          lang && lang.toLowerCase() !== 'other' ? lang.toLowerCase() : 'javascript';
        const highlighted = await codeToHtml(codeText, { lang: language, theme });
        const tempDoc = parser.parseFromString(highlighted, 'text/html');
        const shikiCode = tempDoc.querySelector('code');
        if (shikiCode) {
          codeElem.innerHTML = shikiCode.innerHTML;
        } else {
          codeElem.innerHTML = escapeHtml(codeText);
        }
      } catch (e) {
        codeElem.innerHTML = escapeHtml(codeText);
      }
    }
  }

  return doc.body.innerHTML;
}
