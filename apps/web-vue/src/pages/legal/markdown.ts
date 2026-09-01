import { marked } from 'marked';

// Ported render pipeline for the 3 legal content.mdx (now .md, LastUpdated line dropped):
// marked → HTML string, then heading ids get GitHub-style slugs so the LegalLayout TOC anchors match.

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function renderLegalMarkdown(src: string): string {
  const html = marked.parse(src, { async: false });
  return html.replace(/<h([1-6])>(.*?)<\/h\1>/g, (_m, depth: string, inner: string) => {
    const plain = inner.replace(/<[^>]*>/g, '');
    return `<h${depth} id="${slugify(plain)}">${inner}</h${depth}>`;
  });
}
