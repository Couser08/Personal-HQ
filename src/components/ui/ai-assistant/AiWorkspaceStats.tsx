import { motion } from 'framer-motion';
import { 
  IconCheck, IconClock, IconFlame, IconBookmark, 
  IconCalendar, IconListCheck, IconTarget
} from '@tabler/icons-react';
import type { AiHistoryItem } from '../../../store/types';

interface AiWorkspaceStatsProps {
  workspaceStats: {
    completedToday: number;
    totalToday: number;
    pending: number;
    habitsDue: number;
    maxStreak: number;
  };
  historyItems: AiHistoryItem[];
  setActiveView: (view: 'chat' | 'history') => void;
  setSelectedHistoryItem: (item: AiHistoryItem) => void;
  handleChatSubmit: (prompt: string) => void;
}

const quickTools = [
  { label: 'Plan My Day', sub: 'Smart daily planner', icon: IconCalendar, color: 'text-blue-500 bg-blue-500/10', prompt: 'Plan my day based on my current tasks' },
  { label: 'Break Task', sub: 'Split into steps', icon: IconListCheck, color: 'text-purple-500 bg-purple-500/10', prompt: 'Break down a task' },
  { label: 'Set Reminder', sub: 'Never miss a task', icon: IconClock, color: 'text-amber-500 bg-amber-500/10', prompt: 'Help me set a reminder for my tasks' },
  { label: 'Focus Mode', sub: 'Eliminate distractions', icon: IconTarget, color: 'text-emerald-500 bg-emerald-500/10', prompt: 'Help me focus on my most important task' },
];

export const AiWorkspaceStats = ({
  workspaceStats,
  historyItems,
  setActiveView,
  setSelectedHistoryItem,
  handleChatSubmit,
}: AiWorkspaceStatsProps) => {
  return (
    <div className="w-60 shrink-0 flex flex-col overflow-y-auto custom-scrollbar border-l border-border hidden sm:flex">
      <div className="flex flex-col gap-5 p-4">
        {/* Quick Tools */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">Quick Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickTools.map(tool => {
              const Icon = tool.icon;
              return (
                <motion.button 
                  key={tool.label} 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.96 }} 
                  onClick={() => { setActiveView('chat'); handleChatSubmit(tool.prompt); }} 
                  className="p-3 rounded-xl bg-surface-alt border border-border text-left hover:border-primary/40 cursor-pointer transition-all group flex flex-col gap-2"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tool.color}`}>
                    <Icon size={15} stroke={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-text-primary group-hover:text-primary transition-colors leading-tight">{tool.label}</p>
                    <p className="text-[10px] text-text-muted leading-tight mt-0.5">{tool.sub}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Today's Insights */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">Today's Insights</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between py-2 border-b border-border/60">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <IconCheck size={14} className="text-emerald-500" />
                <span>Tasks Completed</span>
              </div>
              <span className="text-xs font-bold text-text-primary">{workspaceStats.completedToday} / {workspaceStats.totalToday || workspaceStats.pending}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/60">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <IconClock size={14} className="text-blue-500" />
                <span>Habits Due</span>
              </div>
              <span className="text-xs font-bold text-text-primary">{workspaceStats.habitsDue} left</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <IconFlame size={14} className="text-orange-500" />
                <span>Streak</span>
              </div>
              <span className="text-xs font-bold text-text-primary">{workspaceStats.maxStreak} days 🔥</span>
            </div>
          </div>
        </div>

        {/* Recent Chats */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Recent Chats</h3>
            <button onClick={() => setActiveView('history')} className="text-[10px] font-bold text-primary hover:underline cursor-pointer">View all</button>
          </div>
          <div className="flex flex-col gap-1.5">
            {historyItems.slice(0, 4).length === 0 ? (
              <p className="text-[11px] text-text-muted">No history yet.</p>
            ) : historyItems.slice(0, 4).map(item => (
              <button 
                key={item.id} 
                onClick={() => { setSelectedHistoryItem(item); setActiveView('history'); }} 
                className="flex items-center gap-2.5 py-2 border-b border-border/50 text-left group cursor-pointer hover:border-primary/30 transition-all w-full"
              >
                <div className="w-5 h-5 rounded-md bg-surface-alt border border-border flex items-center justify-center shrink-0">
                  <IconBookmark size={11} className="text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-text-primary truncate group-hover:text-primary transition-colors">{item.title}</p>
                  <p className="text-[10px] text-text-muted">{new Date(item.createdAt || item.timestamp || Date.now()).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
