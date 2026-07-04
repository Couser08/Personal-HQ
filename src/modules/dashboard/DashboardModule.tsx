import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconChecklist, IconWallet, IconClockPlay, IconSitemap, 
  IconPlus, IconArrowRight, IconTarget, IconFlame
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

  // ── 3. Recent Mind Maps ──────────────────────────────────────────────
  const recentMindmaps = mindmaps.slice(0, 2);

  // ── 4. Grid Animations ──────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-10 text-left"
    >
      {/* Premium Apple Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-text-primary tracking-tight">
          Welcome Home
        </h1>
        <p className="text-text-secondary text-sm">Your productivity, finances, and study logs in one place.</p>
      </motion.div>

      {/* Quick Action Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveModule('todo')}
          className="flex items-center gap-4 bg-white/70 dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900 border border-border/50 rounded-2xl p-4 shadow-sm transition-all hover:scale-[1.01] hover:shadow cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <IconChecklist className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-xs font-bold text-text-primary">Add Task</h3>
            <p className="text-[10px] text-text-muted mt-0.5">Organize your schedules</p>
          </div>
          <IconPlus className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
        </button>

        <button
          onClick={() => setActiveModule('budget')}
          className="flex items-center gap-4 bg-white/70 dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900 border border-border/50 rounded-2xl p-4 shadow-sm transition-all hover:scale-[1.01] hover:shadow cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <IconWallet className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-xs font-bold text-text-primary">Log Expense</h3>
            <p className="text-[10px] text-text-muted mt-0.5">Track incomes & payments</p>
          </div>
          <IconPlus className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
        </button>

        <button
          onClick={() => setActiveModule('pomodoro')}
          className="flex items-center gap-4 bg-white/70 dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900 border border-border/50 rounded-2xl p-4 shadow-sm transition-all hover:scale-[1.01] hover:shadow cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <IconClockPlay className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-xs font-bold text-text-primary">Start Focus</h3>
            <p className="text-[10px] text-text-muted mt-0.5">Start deep focus timer</p>
          </div>
          <IconArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
        </button>
      </motion.div>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Todo & Finances */}
        <div className="flex flex-col gap-6">
          {/* TO-DO WIDGET */}
          <motion.div variants={itemVariants} className="bg-white/60 dark:bg-stone-900/50 border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4 backdrop-blur-md">
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <IconChecklist className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-black uppercase tracking-wider text-text-primary">Today's Tasks</span>
              </div>
              <button 
                onClick={() => setActiveModule('todo')}
                className="text-[10px] font-extrabold text-rose-500 hover:text-rose-600 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
              >
                View All ({totalTodoCount}) <IconArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {activeTasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-text-muted italic">
                  All caught up! No tasks left for today.
                </div>
              ) : (
                activeTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 bg-white/40 dark:bg-stone-900/40 rounded-2xl border border-border/30 shadow-inner group"
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => updateTodoTask(task.id, { completed: !task.completed })}
                        className="w-4 h-4 rounded-full border-border bg-transparent text-rose-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-text-primary truncate max-w-[200px]">
                        {task.title}
                      </span>
                    </div>
                    {task.priority && (
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
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
          </motion.div>

          {/* FINANCE SPLIT WIDGET */}
          <motion.div variants={itemVariants} className="bg-white/60 dark:bg-stone-900/50 border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4 backdrop-blur-md">
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <IconWallet className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-black uppercase tracking-wider text-text-primary">Ledger Summary</span>
              </div>
              <button 
                onClick={() => setActiveModule('budget')}
                className="text-[10px] font-extrabold text-blue-500 hover:text-blue-600 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
              >
                Log Ledger <IconArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/40 dark:bg-stone-900/40 rounded-2xl border border-border/30 text-center shadow-inner">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1">Bank / UPI Balance</span>
                <span className="text-lg font-black text-text-primary">
                  ₹{bankBalance.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-4 bg-white/40 dark:bg-stone-900/40 rounded-2xl border border-border/30 text-center shadow-inner">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1">Cash Balance</span>
                <span className="text-lg font-black text-text-primary">
                  ₹{cashBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Total Net Balances</span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">₹{totalBalance.toLocaleString('en-IN')}</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Pomodoro & Mindmaps */}
        <div className="flex flex-col gap-6">
          {/* POMODORO STATS WIDGET */}
          <motion.div variants={itemVariants} className="bg-white/60 dark:bg-stone-900/50 border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4 backdrop-blur-md">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/40 dark:bg-stone-900/40 rounded-2xl border border-border/30 flex items-center gap-3 shadow-inner">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <IconFlame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Streak</span>
                  <span className="text-base font-black text-text-primary">{pomodoroStreak} Sessions</span>
                </div>
              </div>

              <div className="p-4 bg-white/40 dark:bg-stone-900/40 rounded-2xl border border-border/30 flex items-center gap-3 shadow-inner">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <IconTarget className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Total Sessions</span>
                  <span className="text-base font-black text-text-primary">{pomodoroStats.totalSessions} Focus</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Minutes Spent Focusing</span>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400">{pomodoroStats.totalMinutes} mins</span>
            </div>
          </motion.div>

          {/* MINDMAP WIDGET */}
          <motion.div variants={itemVariants} className="bg-white/60 dark:bg-stone-900/50 border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4 backdrop-blur-md">
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <IconSitemap className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-black uppercase tracking-wider text-text-primary">Recent Mind Maps</span>
              </div>
              <button 
                onClick={() => setActiveModule('mindmap')}
                className="text-[10px] font-extrabold text-purple-500 hover:text-purple-600 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
              >
                Canvas Board <IconArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {recentMindmaps.length === 0 ? (
                <div className="text-center py-6 text-xs text-text-muted italic">
                  No mind maps yet. Click Canvas Board to create one.
                </div>
              ) : (
                recentMindmaps.map(m => (
                  <div 
                    key={m.id} 
                    onClick={() => setActiveModule('mindmap')}
                    className="flex items-center justify-between p-3 bg-white/40 dark:bg-stone-900/40 hover:bg-stone-50 dark:hover:bg-stone-900 border border-border/30 rounded-2xl shadow-inner cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                        <IconSitemap className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-text-primary truncate max-w-[200px]">
                        {m.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                      {m.nodes.length} Nodes
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}
