export function stripHtml(html: string): string {
  const documentRef = globalThis.document;
  if (!documentRef) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const div = documentRef.createElement('div');
  div.innerHTML = html;
  return div.textContent ?? div.innerText ?? '';
}
