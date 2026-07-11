import React from 'react';
import { 
  IconPlus, IconTrash, IconCheck, IconSun, IconCalendarEvent, IconLayoutList, IconChevronLeft 
} from '@tabler/icons-react';
import type { TodoTask, TodoProject } from '../../store/useAppStore';
import { useAppStore } from '../../store/useAppStore';

const isToday = (dateStr: string | null) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

const isUpcoming = (dateStr: string | null) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  d.setHours(0,0,0,0);
  return d.getTime() > today.getTime();
};

interface TodoSidebarProps {
  activeList: 'all' | 'today' | 'upcoming' | 'completed' | 'trash' | string;
  setActiveList: (list: 'all' | 'today' | 'upcoming' | 'completed' | 'trash' | string) => void;
  todoTasks: TodoTask[];
  todoProjects: TodoProject[];
  deleteTodoProject: (id: string) => void;
  openTodoProjectModal: () => void;
  tickStyle: 'default' | 'bounce' | 'minimal';
  setTickStyle: (style: 'default' | 'bounce' | 'minimal') => void;
  strikeStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'wavy';
  setStrikeStyle: (style: 'solid' | 'dashed' | 'dotted' | 'double' | 'wavy') => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

export const TodoSidebar: React.FC<TodoSidebarProps> = ({
  activeList,
  setActiveList,
  todoTasks,
  todoProjects,
  deleteTodoProject,
  openTodoProjectModal,
  tickStyle,
  setTickStyle,
  strikeStyle,
  setStrikeStyle,
  isSidebarOpen = false,
  setIsSidebarOpen,
}) => {
  const settings = useAppStore(state => state.settings);
  const updateSettings = useAppStore(state => state.updateSettings);
  const todoCompletionAnimation = settings.todoCompletionAnimation || 'circle-fill-confetti';

  const handleItemClick = (listId: string) => {
    setActiveList(listId);
    if (setIsSidebarOpen) {
      setIsSidebarOpen(false); // Close sidebar on mobile select
    }
  };

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
        />
      )}
      <div className={`w-64 border-r border-border bg-surface/95 dark:bg-surface-alt/95 md:bg-surface/50 p-4 flex flex-col gap-6 overflow-y-auto shrink-0 text-left select-none fixed md:relative inset-y-0 left-0 z-50 transition-transform duration-300 md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Lists */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">My Lists</h3>
            {setIsSidebarOpen && (
              <button 
                className="md:hidden text-text-secondary hover:text-text-primary p-1 cursor-pointer"
                onClick={() => setIsSidebarOpen(false)}
              >
                <IconChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <NavItem 
              icon={<IconLayoutList className="w-4 h-4 text-rose-500" />} 
              label="All Tasks" count={todoTasks.filter(t => !t.completed && !t.deleted).length} 
              active={activeList === 'all'} onClick={() => handleItemClick('all')} 
            />
            <NavItem 
              icon={<IconSun className="w-4 h-4 text-orange-500" />} 
              label="Today" count={todoTasks.filter(t => !t.completed && !t.deleted && isToday(t.dueDate)).length} 
              active={activeList === 'today'} onClick={() => handleItemClick('today')} 
            />
            <NavItem 
              icon={<IconCalendarEvent className="w-4 h-4 text-text-secondary" />} 
              label="Upcoming" count={todoTasks.filter(t => !t.completed && !t.deleted && isUpcoming(t.dueDate)).length} 
              active={activeList === 'upcoming'} onClick={() => handleItemClick('upcoming')} 
            />
            <NavItem 
              icon={<IconCheck className="w-4 h-4 text-text-secondary" />} 
              label="Completed" count={todoTasks.filter(t => t.completed && !t.deleted).length} 
              active={activeList === 'completed'} onClick={() => handleItemClick('completed')} 
            />
            <NavItem 
              icon={<IconTrash className="w-4 h-4 text-text-secondary" />} 
              label="Trash" count={todoTasks.filter(t => t.deleted).length}
              active={activeList === 'trash'} onClick={() => handleItemClick('trash')} 
            />
          </div>
        </div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Projects</h3>
            <button 
              type="button"
              className="text-text-muted hover:text-text-primary cursor-pointer"
              onClick={() => openTodoProjectModal()}
            >
              <IconPlus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {todoProjects.map(p => (
              <div key={p.id} className="group relative">
                <NavItem 
                  icon={<div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />} 
                  label={p.name} 
                  count={todoTasks.filter(t => t.projectId === p.id && !t.completed && !t.deleted).length} 
                  active={activeList === p.id} onClick={() => handleItemClick(p.id)} 
                />
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); deleteTodoProject(p.id); if (activeList === p.id) setActiveList('all'); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-rose-500 transition-colors cursor-pointer"
                  title="Delete Project"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Settings Area */}
        <div className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-3">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Tick Style</h3>
            <div className="flex gap-1.5">
              <button onClick={() => setTickStyle('default')} className={`px-2 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${tickStyle === 'default' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'}`}>Default</button>
              <button onClick={() => setTickStyle('bounce')} className={`px-2 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${tickStyle === 'bounce' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'}`}>Bounce</button>
              <button onClick={() => setTickStyle('minimal')} className={`px-2 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${tickStyle === 'minimal' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'}`}>Minimal</button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Check Animation</h3>
            <select
              value={todoCompletionAnimation}
              onChange={(e) => updateSettings({ todoCompletionAnimation: e.target.value })}
              className="w-full bg-surface-alt border border-border text-xs rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer text-text-secondary font-bold hover:bg-surface-hover transition-all"
            >
              <option value="circle-fill-confetti">Circle + Confetti</option>
              <option value="ripple-particles">Ripple + Particles</option>
              <option value="bounce-circle">Bounce Circle</option>
              <option value="pop-confetti">Pop + Confetti</option>
              <option value="sweep-fill">Sweep Line</option>
              <option value="emoji-pop">Emoji Pop</option>
              <option value="star-burst">Star Burst</option>
            </select>
          </div>

          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Strike Style</h3>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setStrikeStyle('solid')} className={`px-2 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${strikeStyle === 'solid' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'}`}>Solid</button>
              <button onClick={() => setStrikeStyle('dashed')} className={`px-2 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${strikeStyle === 'dashed' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'}`}>Dashed</button>
              <button onClick={() => setStrikeStyle('dotted')} className={`px-2 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${strikeStyle === 'dotted' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'}`}>Dotted</button>
              <button onClick={() => setStrikeStyle('double')} className={`px-2 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${strikeStyle === 'double' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'}`}>Double</button>
              <button onClick={() => setStrikeStyle('wavy')} className={`px-2 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${strikeStyle === 'wavy' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'}`}>Wavy</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Internal NavItem Helper
function NavItem({ icon, label, count, active, onClick }: { icon: React.ReactNode, label: string, count?: number, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all w-full cursor-pointer ${
        active 
          ? 'bg-rose-500/10 text-rose-500 font-bold' 
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-rose-500/20 text-rose-600' : 'bg-surface-alt border border-border'}`}>
          {count}
        </span>
      )}
    </button>
  );
}
