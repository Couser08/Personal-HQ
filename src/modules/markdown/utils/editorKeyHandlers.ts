import React from 'react';

export const handleAutoListContinuation = (
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  onContentChange: (newContent: string) => void,
) => {
  if (e.key !== 'Enter') return false;

  const textarea = e.currentTarget;
  const value = textarea.value;
  const selectionStart = textarea.selectionStart;
  const selectionEnd = textarea.selectionEnd;

  const textBeforeCursor = value.slice(0, selectionStart);
  const lastNewLine = textBeforeCursor.lastIndexOf('\n');
  const currentLineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
  const currentLine = textBeforeCursor.slice(currentLineStart);

  const checklistMatch = currentLine.match(/^(\s*)-\s*\[([ x])\]\s*(.*)/i);
  const bulletMatch = currentLine.match(/^(\s*)[-*]\s+(.*)/);
  const numberedMatch = currentLine.match(/^(\s*)(\d+)\.\s*(.*)/);

  if (checklistMatch) {
    e.preventDefault();
    const indent = checklistMatch[1];
    const content = checklistMatch[3].trim();
    if (!content) {
      const beforeLine = value.slice(0, currentLineStart);
      const afterCursor = value.slice(selectionEnd);
      const newContent = beforeLine + '\n' + afterCursor;
      onContentChange(newContent);
      setTimeout(() => {
        textarea.setSelectionRange(currentLineStart + 1, currentLineStart + 1);
      }, 0);
    } else {
      const prefix = `\n${indent}- [ ] `;
      const newContent = value.slice(0, selectionStart) + prefix + value.slice(selectionEnd);
      onContentChange(newContent);
      setTimeout(() => {
        const newCursor = selectionStart + prefix.length;
        textarea.setSelectionRange(newCursor, newCursor);
      }, 0);
    }
    return true;
  } else if (bulletMatch) {
    e.preventDefault();
    const indent = bulletMatch[1];
    const content = bulletMatch[2].trim();
    if (!content) {
      const beforeLine = value.slice(0, currentLineStart);
      const afterCursor = value.slice(selectionEnd);
      const newContent = beforeLine + '\n' + afterCursor;
      onContentChange(newContent);
      setTimeout(() => {
        textarea.setSelectionRange(currentLineStart + 1, currentLineStart + 1);
      }, 0);
    } else {
      const prefix = `\n${indent}- `;
      const newContent = value.slice(0, selectionStart) + prefix + value.slice(selectionEnd);
      onContentChange(newContent);
      setTimeout(() => {
        const newCursor = selectionStart + prefix.length;
        textarea.setSelectionRange(newCursor, newCursor);
      }, 0);
    }
    return true;
  } else if (numberedMatch) {
    e.preventDefault();
    const indent = numberedMatch[1];
    const number = parseInt(numberedMatch[2], 10);
    const content = numberedMatch[3].trim();
    if (!content) {
      const beforeLine = value.slice(0, currentLineStart);
      const afterCursor = value.slice(selectionEnd);
      const newContent = beforeLine + '\n' + afterCursor;
      onContentChange(newContent);
      setTimeout(() => {
        textarea.setSelectionRange(currentLineStart + 1, currentLineStart + 1);
      }, 0);
    } else {
      const prefix = `\n${indent}${number + 1}. `;
      const newContent = value.slice(0, selectionStart) + prefix + value.slice(selectionEnd);
      onContentChange(newContent);
      setTimeout(() => {
        const newCursor = selectionStart + prefix.length;
        textarea.setSelectionRange(newCursor, newCursor);
      }, 0);
    }
    return true;
  }

  return false;
};
