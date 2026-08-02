import { useState } from 'react';
import { 
  IconFlame, 
  IconChevronDown, 
  IconChevronUp, 
  IconBookmark, 
  IconBulb,
  IconDeviceDesktop,
  IconCurrencyDollar,
  IconUsers,
  IconMoodSmile,
  IconCheck
} from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StudyQuestionCardProps {
  qna: any;
  index: number;
}

const listStyles = [
  { bg: 'bg-blue-50', text: 'text-blue-500', icon: IconDeviceDesktop },
  { bg: 'bg-green-50', text: 'text-green-500', icon: IconCurrencyDollar },
  { bg: 'bg-orange-50', text: 'text-orange-500', icon: IconUsers },
  { bg: 'bg-indigo-50', text: 'text-indigo-500', icon: IconMoodSmile },
  { bg: 'bg-purple-50', text: 'text-purple-500', icon: IconCheck }
];

export function StudyQuestionCard({ qna, index }: StudyQuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden flex transition-all duration-300 mb-6">
      {/* Left Red Border Indicator */}
      <div className="w-1.5 bg-red-400 shrink-0" />
      
      <div className="flex-1 p-6">
        {/* Header Badges & Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-500 border border-red-100">
            <IconFlame size={14} className="stroke-2" />
            <span className="text-[10px] font-black uppercase tracking-widest">{qna.probability} Probability</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-text-tertiary hover:text-text-primary transition-colors cursor-pointer">
              <IconBookmark size={20} />
            </button>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            >
              {isExpanded ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
            </button>
          </div>
        </div>

        {/* Question Title */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left flex items-start gap-4 mb-2 cursor-pointer group outline-none"
        >
          <div className="w-8 h-8 shrink-0 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>
          <h3 className="font-bold text-lg text-text-primary pt-0.5 leading-snug group-hover:text-primary transition-colors">
            {qna.question}
          </h3>
        </button>

        {/* CSS Grid Animation for zero layout thrashing */}
        <div 
          className="grid transition-all duration-300 ease-in-out" 
          style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="pt-6 pb-2 pl-12 pr-4 text-sm text-text-secondary leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, children, ...props }) => {
                    const isFirst = node?.position?.start?.line === 1;
                    if (isFirst) {
                      return (
                        <div className="mb-8 p-5 rounded-2xl bg-red-50/50 border border-red-100 relative">
                          <div className="flex items-center gap-2 text-red-500 mb-3">
                            <IconBulb size={20} className="stroke-2" />
                            <span className="font-bold tracking-tight">Definition</span>
                          </div>
                          <p className="text-text-primary leading-relaxed" {...props}>
                            {children}
                          </p>
                        </div>
                      );
                    }
                    return <p className="mb-4 text-text-primary" {...props}>{children}</p>;
                  },
                  h3: ({ node, children, ...props }) => (
                    <h3 className="text-base font-bold text-text-primary mb-6" {...props}>
                      {children}
                    </h3>
                  ),
                  h4: ({ node, children, ...props }) => (
                    <h4 className="text-sm font-bold text-text-primary mb-4" {...props}>
                      {children}
                    </h4>
                  ),
                  ul: ({ node, children, ...props }) => (
                    <ul className="flex flex-col gap-6" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ node, children, ...props }) => (
                    <ol className="flex flex-col gap-6" {...props}>
                      {children}
                    </ol>
                  ),
                  li: ({ node, children, ...props }: any) => {
                    // Generate deterministic index-like number from string length
                    const strContent = children?.toString() || '';
                    const styleIdx = (strContent.length + 1) % listStyles.length;
                    const style = listStyles[styleIdx] || listStyles[0];
                    const Icon = style.icon;
                    
                    return (
                      <li className="flex items-start gap-5" {...props}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                          <Icon size={24} className="stroke-[1.5]" />
                        </div>
                        <div className="flex-1 pt-1 text-text-secondary leading-relaxed">
                          {children}
                        </div>
                      </li>
                    );
                  },
                  strong: ({ node, children, ...props }) => (
                    <strong className="font-bold text-text-primary" {...props}>
                      {children}
                    </strong>
                  ),
                }}
              >
                {qna.answer}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
