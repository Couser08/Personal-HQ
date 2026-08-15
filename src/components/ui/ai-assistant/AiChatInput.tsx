import { motion } from 'framer-motion';
import { IconSend } from '@tabler/icons-react';

interface AiChatInputProps {
  prompt: string;
  setPrompt: (val: string) => void;
  isGenerating: boolean;
  handleChatSubmit: (promptOverride?: string) => void;
}

const quickChips = [
  { label: 'Summarize', icon: '📄', prompt: 'Summarize my current tasks and priorities' },
  { label: 'Break it down', icon: '⚡', prompt: 'Break down a task' },
  { label: 'Create Plan', icon: '🎯', prompt: 'Help me build a realistic 6-month goal plan' },
  { label: 'Set Goal', icon: '🏁', prompt: 'Set up a new weekly goal for me' },
];

export const AiChatInput = ({
  prompt,
  setPrompt,
  isGenerating,
  handleChatSubmit
}: AiChatInputProps) => {
  return (
    <div className="px-5 pt-3 pb-4 border-t border-border bg-surface shrink-0">
      {/* Quick chips */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto custom-scrollbar pb-1">
        {quickChips.map(chip => (
          <motion.button 
            key={chip.label} 
            whileTap={{ scale: 0.94 }} 
            onClick={() => handleChatSubmit(chip.prompt)} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-alt border border-border text-[11px] font-semibold text-text-secondary hover:border-primary/40 hover:text-text-primary shrink-0 cursor-pointer transition-all"
          >
            <span>{chip.icon}</span>{chip.label}
          </motion.button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-alt border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChatSubmit()}
            placeholder="Ask me anything or describe a multi-step request..."
            className="flex-1 text-xs bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => handleChatSubmit()}
          disabled={isGenerating || !prompt.trim()}
          className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-text-on-accent cursor-pointer hover:opacity-90 disabled:opacity-40 transition-all shrink-0 shadow-sm"
        >
          <IconSend size={16} />
        </motion.button>
      </div>
      <p className="text-[10px] text-text-muted mt-2 px-0.5">Tip: Vague requests get a short form first — answer it for better results</p>
    </div>
  );
};
