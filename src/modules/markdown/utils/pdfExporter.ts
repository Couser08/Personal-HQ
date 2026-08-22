export const exportMarkdownToPdf = (title: string) => {
  const previewEl = document.getElementById('markdown-preview-pane');
  if (!previewEl) return;

  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
  if (!doc) return;

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join('\n');

  const htmlContent = `
    <html>
      <head>
        <title>${title || 'document'}</title>
        ${styles}
        <style>
          body {
            background: white !important;
            color: black !important;
            padding: 40px !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          }
          .md-code-block {
            background: #f4f4f5 !important;
            border: 1px solid #e4e4e7 !important;
            color: #18181b !important;
            page-break-inside: avoid;
          }
          .md-code-header {
            background: #e4e4e7 !important;
            border-bottom: 1px solid #d4d4d8 !important;
            color: #27272a !important;
          }
          .code-line {
            border-bottom: none !important;
          }
          .code-ln {
            color: #a1a1aa !important;
            border-right: 1px solid #e4e4e7 !important;
          }
          code, pre {
            background: #f4f4f5 !important;
            color: #09090b !important;
          }
          h1, h2, h3, h4, h5, h6 {
            color: black !important;
            border-color: #e4e4e7 !important;
            page-break-after: avoid;
          }
          th, td {
            border-color: #d4d4d8 !important;
          }
          thead {
            background: #f4f4f5 !important;
          }
          blockquote {
            border-color: #d4d4d8 !important;
            color: #71717a !important;
          }
          hr {
            border-color: #e4e4e7 !important;
          }
          @page {
            size: A4;
            margin: 20mm;
          }
        </style>
      </head>
      <body class="dark:bg-white dark:text-black">
        <div class="markdown-preview-content md-preview">
          ${previewEl.innerHTML}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.frameElement.remove();
            }, 100);
          };
        </script>
      </body>
    </html>
  `;

  doc.open();
  doc.write(htmlContent);
  doc.close();
};
