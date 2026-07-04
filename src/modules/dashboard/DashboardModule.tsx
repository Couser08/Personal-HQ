import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconChecklist, IconWallet, IconClockPlay, IconSitemap, 
  IconPlus, IconArrowRight, IconFlame, IconTarget, IconCoins
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

export default function DashboardModule() {
  const { 
    todoTasks, 
    budgetTransactions, 
    initialBankBalance, 
    initialCashBalance,
    pomodoroStreak,
    pomodoroStats,
    mindmaps,
    setActiveModule,
    updateTodoTask
  } = useAppStore(useShallow(state => ({
    todoTasks: state.todoTasks,
    budgetTransactions: state.budgetTransactions,
    initialBankBalance: state.settings.initialBankBalance,
    initialCashBalance: state.settings.initialCashBalance,
    pomodoroStreak: state.pomodoroStreak,
    pomodoroStats: state.pomodoroStats,
    mindmaps: state.mindmaps,
    setActiveModule: state.setActiveModule,
    updateTodoTask: state.updateTodoTask
  })));

  // ── 1. Calculate Balances ───────────────────────────────────────────
  let bankDiff = 0;
  let cashDiff = 0;
  budgetTransactions.forEach(t => {
    const isOnline = t.paymentMethod === 'online' || !t.paymentMethod;
    if (t.type === 'income') {
      if (isOnline) bankDiff += t.amount;
      else cashDiff += t.amount;
    } else {
      if (isOnline) bankDiff -= t.amount;
      else cashDiff -= t.amount;
    }
  });
  const bankBalance = initialBankBalance + bankDiff;
  const cashBalance = initialCashBalance + cashDiff;
  const totalBalance = bankBalance + cashBalance;

  // ── 2. To-Do Tasks ──────────────────────────────────────────────────
  const activeTasks = todoTasks.filter(t => !t.completed && !t.deleted).slice(0, 3);
  const totalTodoCount = todoTasks.filter(t => !t.completed && !t.deleted).length;
  const completedTodayCount = todoTasks.filter(t => t.completed && !t.deleted).length;
  const totalTodayTasks = todoTasks.filter(t => !t.deleted).length;
  const completePercentage = totalTodayTasks > 0 ? Math.round((completedTodayCount / totalTodayTasks) * 100) : 0;

  // ── 3. Recent Mind Maps ──────────────────────────────────────────────
  const recentMindmaps = mindmaps.slice(0, 4);

  // ── 4. Animations ──────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10 text-left"
    >
      {/* Top Banner Greeting */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            Workspace Hub
          </h1>
          <p className="text-text-secondary text-xs mt-1">Hello! Here's a glance at your workspace stats today.</p>
        </div>

        {/* Global Quick Action Pills */}
        <div className="flex gap-2 self-start md:self-auto">
          <button
            onClick={() => setActiveModule('todo')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-900 border border-border/50 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 text-[10px] font-extrabold uppercase tracking-wider text-text-secondary transition-all cursor-pointer"
          >
            <IconPlus className="w-3.5 h-3.5" /> Task
          </button>
          <button
            onClick={() => setActiveModule('budget')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-900 border border-border/50 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 text-[10px] font-extrabold uppercase tracking-wider text-text-secondary transition-all cursor-pointer"
          >
            <IconPlus className="w-3.5 h-3.5" /> Expense
          </button>
          <button
            onClick={() => setActiveModule('pomodoro')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white rounded-xl hover:bg-primary/95 text-[10px] font-extrabold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
          >
            <IconClockPlay className="w-3.5 h-3.5" /> Focus
          </button>
        </div>
      </motion.div>

      {/* Apple-style Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-5 auto-rows-auto">
        
        {/* BENTO CARD 1: 3D Illustration Greeting Card */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-500/15 via-rose-500/5 to-transparent border border-border/40 rounded-3xl p-6 flex flex-col justify-between col-span-12 lg:col-span-5 h-[270px] shadow-sm"
        >
          <div className="max-w-[62%] relative z-10">
            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Daily Inspiration</span>
            <h2 className="text-xl font-black text-text-primary tracking-tight mt-2.5 leading-tight">Focus on what matters.</h2>
            <p className="text-text-muted text-xs mt-1.5 font-medium leading-relaxed">Organize your thoughts, track your resources, and build positive habits in a unified space.</p>
          </div>
          
          <div className="relative z-10 flex gap-2 mt-auto">
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[9px] uppercase tracking-wider border border-indigo-500/10">Mind Maps</span>
            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[9px] uppercase tracking-wider border border-rose-500/10">Ledgers</span>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-[42%] flex items-center justify-end select-none pointer-events-none">
            <img 
              src="/study_illustration.png" 
              alt="Study 3D Illustration" 
              className="h-[88%] object-contain object-right-bottom translate-y-3 pr-2"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        </motion.div>

        {/* BENTO CARD 2: To-Do Checklist & Circular Tracker */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/60 dark:bg-stone-900/50 border border-border/40 rounded-3xl p-5 shadow-sm col-span-12 lg:col-span-7 h-[270px] flex flex-col justify-between backdrop-blur-md"
        >
          <div className="flex justify-between items-center pb-2 border-b border-border/30">
            <div className="flex items-center gap-2">
              <IconChecklist className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">Today's Reminders</span>
            </div>
            <button 
              onClick={() => setActiveModule('todo')}
              className="text-[10px] font-extrabold text-rose-500 hover:text-rose-600 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
            >
              Checklist ({totalTodoCount}) <IconArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex gap-4 flex-1 items-center mt-3">
            {/* Active task list */}
            <div className="flex-1 flex flex-col gap-2 max-h-[170px] overflow-y-auto pr-1">
              {activeTasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-text-muted italic">
                  All tasks checked off! Nice work.
                </div>
              ) : (
                activeTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-2.5 bg-surface/50 border border-border/30 rounded-xl shadow-inner group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input 
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => updateTodoTask(task.id, { completed: !task.completed })}
                        className="w-4 h-4 rounded-full border-border bg-transparent text-rose-500 focus:ring-0 cursor-pointer shrink-0"
                      />
                      <span className="text-xs font-semibold text-text-primary truncate">
                        {task.title}
                      </span>
                    </div>
                    {task.priority && (
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                        task.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Circular SVG Complete Ring */}
            <div className="w-[110px] h-[110px] shrink-0 hidden sm:flex flex-col items-center justify-center relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="55" cy="55" r="44" stroke="var(--border-border)" strokeWidth="8" fill="transparent" className="opacity-30" />
                <circle 
                  cx="55" cy="55" r="44" 
                  stroke="var(--color-primary, #f43f5e)" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - completePercentage / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-base font-black text-text-primary">{completePercentage}%</span>
                <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider mt-1">Done</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BENTO CARD 3: Wallet Gradient Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-stone-900 via-stone-950 to-black text-white border border-stone-850 rounded-3xl p-5 shadow-md col-span-12 md:col-span-6 h-[250px] flex flex-col justify-between relative overflow-hidden"
        >
          {/* Top Wallet Header */}
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2 text-stone-300">
              <IconWallet className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-wider">Ledger Account</span>
            </div>
            <IconCoins className="w-5 h-5 text-stone-500" />
          </div>

          {/* Central Balance view */}
          <div className="relative z-10 flex flex-col mt-4">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Total Net Balance</span>
            <span className="text-2xl font-black text-white mt-1 tracking-tight">
              ₹{totalBalance.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Bank vs Cash Breakdowns */}
          <div className="relative z-10 grid grid-cols-2 gap-4 mt-2 pt-3 border-t border-stone-800">
            <div>
              <span className="text-[8px] font-bold text-stone-400 uppercase tracking-wider block">Online (Bank/UPI)</span>
              <span className="text-sm font-black text-stone-200 mt-0.5 block">
                ₹{bankBalance.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[8px] font-bold text-stone-400 uppercase tracking-wider block">Cash Ledger</span>
              <span className="text-sm font-black text-stone-200 mt-0.5 block">
                ₹{cashBalance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setActiveModule('budget')}
            className="relative z-10 w-full mt-auto py-2 bg-stone-800 hover:bg-stone-700/80 rounded-xl text-center text-[9px] font-black uppercase tracking-wider text-stone-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            Manage Balance Logs <IconArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Decorative glowing card effect */}
          <div className="absolute -right-20 -bottom-20 w-44 h-44 rounded-full bg-blue-500/10 blur-[60px] pointer-events-none" />
        </motion.div>

        {/* BENTO CARD 4: Pomodoro Performance Widget */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/60 dark:bg-stone-900/50 border border-border/40 rounded-3xl p-5 shadow-sm col-span-12 md:col-span-6 h-[250px] flex flex-col justify-between backdrop-blur-md"
        >
          <div className="flex justify-between items-center pb-2 border-b border-border/30">
            <div className="flex items-center gap-2">
              <IconClockPlay className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">Focus Performance</span>
            </div>
            <button 
              onClick={() => setActiveModule('pomodoro')}
              className="text-[10px] font-extrabold text-amber-500 hover:text-amber-600 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
            >
              Open Timer <IconArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Streak details */}
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="p-3 bg-surface/50 border border-border/30 rounded-2xl flex items-center gap-3 shadow-inner">
              <div className="w-8.5 h-8.5 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                <IconFlame className="w-4.5 h-4.5" />
              </div>
              <div className="leading-tight">
                <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider block">Streak</span>
                <span className="text-xs font-black text-text-primary">{pomodoroStreak} Days</span>
              </div>
            </div>

            <div className="p-3 bg-surface/50 border border-border/30 rounded-2xl flex items-center gap-3 shadow-inner">
              <div className="w-8.5 h-8.5 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <IconTarget className="w-4.5 h-4.5" />
              </div>
              <div className="leading-tight">
                <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider block">Sessions</span>
                <span className="text-xs font-black text-text-primary">{pomodoroStats.totalSessions} Total</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-text-muted">
              <span>DAILY PROGRESS</span>
              <span className="text-amber-500">{pomodoroStats.totalMinutes} mins / 50</span>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-850 overflow-hidden border border-border/30 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((pomodoroStats.totalMinutes / 50) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 bg-amber-500/[0.04] border border-amber-500/10 rounded-xl text-center text-[10px] font-bold text-amber-600 dark:text-amber-400">
            Keep focusing to reach your daily 50 minutes milestone!
          </div>
        </motion.div>

        {/* BENTO CARD 5: Finder Folders Recent Mindmaps */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/60 dark:bg-stone-900/50 border border-border/40 rounded-3xl p-5 shadow-sm col-span-12 backdrop-blur-md flex flex-col gap-4"
        >
          <div className="flex justify-between items-center pb-2 border-b border-border/30">
            <div className="flex items-center gap-2">
              <IconSitemap className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">Recent Mindmaps</span>
            </div>
            <button 
              onClick={() => setActiveModule('mindmap')}
              className="text-[10px] font-extrabold text-purple-500 hover:text-purple-600 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
            >
              Canvas Board <IconArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-1">
            {recentMindmaps.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-muted italic col-span-4">
                No mindmaps saved yet. Create your first board on the Canvas Board page.
              </div>
            ) : (
              recentMindmaps.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => setActiveModule('mindmap')}
                  className="flex items-center gap-3 p-3 bg-surface hover:bg-stone-50 dark:hover:bg-stone-850 border border-border/40 hover:border-purple-500/25 rounded-2xl shadow-sm cursor-pointer transition-all hover:scale-[1.01] hover:shadow group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/5 group-hover:bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/5 transition-colors">
                    <IconSitemap className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 text-left leading-tight">
                    <h4 className="text-xs font-bold text-text-primary truncate">{m.title}</h4>
                    <span className="text-[9px] text-text-muted mt-0.5 block font-bold uppercase">{m.nodes.length} Nodes</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
