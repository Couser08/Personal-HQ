import { motion } from 'framer-motion';
import { IconSearch, IconStar, IconChevronRight } from '@tabler/icons-react';
import type { AiHistoryItem } from '../../../store/types';

interface AiChatHistoryProps {
  selectedHistoryItem: AiHistoryItem | null;
  setSelectedHistoryItem: (item: AiHistoryItem | null) => void;
  historySearch: string;
  setHistorySearch: (term: string) => void;
  filteredHistory: AiHistoryItem[];
  toggleStarHistory: (id: string) => void;
}

export const AiChatHistory = ({
  selectedHistoryItem,
  setSelectedHistoryItem,
  historySearch,
  setHistorySearch,
  filteredHistory,
  toggleStarHistory
}: AiChatHistoryProps) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
      {selectedHistoryItem ? (
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setSelectedHistoryItem(null)} 
            className="text-xs font-bold text-primary hover:underline self-start cursor-pointer"
          >
            ← Back to History
          </button>
          <h4 className="text-sm font-bold text-text-primary">{selectedHistoryItem.title}</h4>
          <p className="text-xs text-text-muted">{selectedHistoryItem.summary}</p>
          <div className="flex flex-col gap-2">
            {selectedHistoryItem.messages.map(m => (
              <div 
                key={m.id} 
                className={`p-3 rounded-xl text-xs ${m.sender === 'user' ? 'bg-primary text-white self-end' : 'bg-surface-alt border border-border self-start text-text-primary'}`}
              >
                {m.text}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <IconSearch size={14} className="absolute left-3 top-2.5 text-text-muted" />
            <input 
              type="text" 
              value={historySearch} 
              onChange={e => setHistorySearch(e.target.value)} 
              placeholder="Search history..." 
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-surface-alt border border-border text-xs text-text-primary focus:outline-none" 
            />
          </div>
          <div className="flex flex-col gap-2">
            {filteredHistory.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-8">No history found.</p>
            ) : filteredHistory.map(item => (
              <motion.div 
                key={item.id} 
                onClick={() => setSelectedHistoryItem(item)} 
                whileHover={{ scale: 1.01 }} 
                whileTap={{ scale: 0.98 }} 
                className="p-3 rounded-xl bg-surface-alt border border-border flex items-center justify-between cursor-pointer hover:border-primary/40 transition-all group"
              >
                <div>
                  <p className="text-xs font-semibold text-text-primary group-hover:text-primary transition-colors">{item.title}</p>
                  <p className="text-[11px] text-text-muted">{item.summary}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); toggleStarHistory(item.id); }} className="p-1 rounded cursor-pointer">
                    <IconStar size={13} className={item.isStarred ? 'text-amber-500 fill-amber-500' : 'text-text-muted'} />
                  </button>
                  <IconChevronRight size={13} className="text-text-muted group-hover:text-text-primary" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
