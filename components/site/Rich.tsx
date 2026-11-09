/** Renders trusted, author-written HTML from /data (bold text, line breaks…). Never use with visitor input. */
export function Rich({ html, as: Tag = 'span', className }: { html: string; as?: 'span' | 'div' | 'p'; className?: string }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
