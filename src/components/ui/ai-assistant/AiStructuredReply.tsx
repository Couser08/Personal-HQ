import type { AiReplyBlock } from '../../../store/types';

interface AiStructuredReplyProps {
  text: string;
  blocks?: AiReplyBlock[];
}

/**
 * Renders AI chat content as structured UI — never dumps raw markdown source.
 */
export const AiStructuredReply = ({ text, blocks }: AiStructuredReplyProps) => {
  if (!blocks || blocks.length === 0) {
    return <p className="text-xs leading-relaxed text-text-primary whitespace-pre-wrap">{text}</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {text && (
        <p className="text-xs font-semibold leading-relaxed text-text-primary">{text}</p>
      )}
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <h4 key={i} className="text-xs font-bold tracking-tight text-text-primary pt-0.5">
                {block.text}
              </h4>
            );
          case 'paragraph':
            return (
              <p key={i} className="text-xs leading-relaxed text-text-secondary">
                {block.text}
              </p>
            );
          case 'bullets':
            return (
              <ul key={i} className="flex flex-col gap-1.5 m-0 pl-0 list-none">
                {(block.items || []).map((item: any, j: number) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-text-secondary">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            );
          case 'steps':
            return (
              <ol key={i} className="flex flex-col gap-2 m-0 pl-0 list-none">
                {(block.items || []).map((item: any, j: number) => (
                  <li key={j} className="flex items-start gap-2.5 text-xs text-text-secondary">
                    <span className="w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                      {j + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{item}</span>
                  </li>
                ))}
              </ol>
            );
          case 'callout': {
            const styles =
              block.variant === 'warning'
                ? 'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300'
                : block.variant === 'tip'
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                  : 'border-primary/25 bg-primary/5 text-text-secondary';
            const label =
              block.variant === 'warning' ? 'Note' : block.variant === 'tip' ? 'Tip' : 'Note';
            return (
              <div key={i} className={`rounded-xl border px-3 py-2 text-xs leading-relaxed ${styles}`}>
                <span className="font-bold mr-1.5">{label}</span>
                {block.text}
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
};

/** Strip markdown markers for a clean one-line / short preview */
export function plainPreviewFromMarkdown(md: string, maxLen = 160): string {
  const plain = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[>\-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen).trim()}…`;
}
