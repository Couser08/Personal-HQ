export const TEMPLATES = {
  blank: `# Document Title\n\nStart writing here...`,

  dailyLog: `# Daily Project Log

> **Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}  
> **Project:** Personal App  
> **Status:** [Active]  
> **Focus:** Features & UI Development  

---

## 🎯 Daily Objectives
*   [ ] Fix dark mode styling and theme properties.
*   [ ] Refactor drawing canvas helper to lock grounding elements.
*   [ ] Resize popup forms to take proper horizontal and vertical space.

---

## ⏱️ Activity Log

### 🌅 Morning Session (09:00 - 12:30)
- Set up state variables and custom toggle handlers.
- Checked element coordinates inside the main canvas workspace.

### ☀️ Afternoon Session (13:30 - 17:00)
- Tested local file uploader configurations.
- Verified compilation builds cleanly without strict TS errors.

---

## 🛠️ Technical Decisions
To ensure optimal performance, we implemented custom Base64 image caching directly inside user metadata.

---

## ⚠️ Blockers & Roadblocks

> [!WARNING]
> Ensure all unused packages or local imports are cleaned up before launching to prevent build checks from failing.

---

## 🎨 Diagram & Architecture
This diagram outlines the daily state transitions.

\`\`\`mermaid
graph TD
    A[Start] --> B[Daily Review]
    B --> C[Implementation]
    C --> D[Verification Check]
    D --> E[Finish]
\`\`\`

---

## 📅 Action Items for Tomorrow
*   [ ] Implement export functions for custom files.
`,

  roadmap: `# Project Roadmap: Version 1.0

## 📍 Overview
High-level timeline and feature list for the upcoming releases.

---

## 🗺️ Phases & Milestones

### Phase 1: Core System
*   [x] Database structure definitions.
*   [x] Sidebar module toggling.

### Phase 2: Whiteboard & Drawings
*   [ ] Support SVG and high-resolution PNG exports.
*   [ ] Grounding / Locking elements to prevent selections.

---

## 📊 Feature Progress Checklist
*   [x] Custom metadata saves.
*   [x] Export to Markdown.
*   [ ] Mermaid rendering guide.
`,

  spec: `# RFC: Whiteboard Grounding Feature

**Author:** Dev Team  
**Status:** Proposal  

---

## 📖 Introduction
This document details the design specifications for adding element grounding to the drawing whiteboard module.

## 💡 Proposed Solution
Introduce element-specific locking properties to frozen background elements.

\`\`\`typescript
interface CanvasElement {
  id: string;
  type: string;
  locked: boolean; // Grounding property
}
\`\`\`
`
};

export const SLASH_COMMANDS = [
  { label: 'Paragraph', syntax: '', desc: 'Plain text paragraph' },
  { label: 'Heading 1', syntax: '# ', desc: 'Large title heading' },
  { label: 'Heading 2', syntax: '## ', desc: 'Medium section heading' },
  { label: 'Heading 3', syntax: '### ', desc: 'Small subsection heading' },
  { label: 'Checklist Item', syntax: '- [ ] ', desc: 'To-do list item' },
  { label: 'Bullet List', syntax: '- ', desc: 'Simple bullet point' },
  { label: 'Numbered List', syntax: '1. ', desc: 'Numbered list item' },
  { label: 'Blockquote', syntax: '> ', desc: 'Insert quote block' },
  { label: 'Divider', syntax: '\n---\n', desc: 'Horizontal line' },
  { label: 'Bold Text', syntax: '**Bold Text**', desc: 'Emphasize text' },
  { label: 'Italic Text', syntax: '*Italic Text*', desc: 'Slanted text' },
  { label: 'Inline Code', syntax: '`code`', desc: 'Inline monospace text' },
  { label: 'Link', syntax: '[Link Title](https://example.com)', desc: 'Web hyperlink' },
  { label: 'Image', syntax: '![Image Caption](https://example.com/image.jpg)', desc: 'Embedded image' },
  { label: 'Table', syntax: '\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |\n', desc: 'Insert markdown table' },
  { label: 'Code Block', syntax: '```javascript\n\n```', desc: 'Code block syntax' },
  { label: 'Alert Note', syntax: '> [!NOTE]\n> ', desc: 'Blue notice box' },
  { label: 'Alert Warning', syntax: '> [!WARNING]\n> ', desc: 'Yellow warning box' },
];
