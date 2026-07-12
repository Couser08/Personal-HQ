import { useMemo } from 'react';
import { IconInfoCircle } from '@tabler/icons-react';
import { formatCurrency, CATEGORY_EMOJIS, getCategoryConfig } from '../utils/budgetUtils';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  parsedTitle: string;
  parsedCategory: string;
}

export function BudgetStatsDonut({
  transactions,
  totalIncome,
  totalExpenses,
  currencyCode,
}: {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  currencyCode: string;
}) {
  // Calculate relative time helper
  const getRelativeTimeLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Extract recent 5 transactions for the list
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Donut chart stroke dash math
  const r = 50;
  const circumference = 2 * Math.PI * r; // ~314.16

  const stats = useMemo(() => {
    const total = totalIncome + totalExpenses;
    if (total === 0) {
      return {
        expensePercent: 0,
        incomePercent: 0,
        expenseOffset: 0,
        incomeOffset: 0,
        isEmpty: true,
      };
    }

    const expensePercent = (totalExpenses / total) * 100;
    const incomePercent = (totalIncome / total) * 100;

    // Expenses start at top (offset = 0)
    // Income starts after expenses
    const expenseOffset = 0;
    const incomeOffset = -(expensePercent / 100) * circumference;

    return {
      expensePercent,
      incomePercent,
      expenseOffset,
      incomeOffset,
      isEmpty: false,
    };
  }, [totalIncome, totalExpenses, circumference]);

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-subtle flex flex-col gap-5 text-left h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-text-primary">
          <span className="text-sm font-bold tracking-tight">Statistic</span>
          <IconInfoCircle className="w-4 h-4 text-text-muted cursor-pointer hover:text-text-primary transition-colors" />
        </div>
        <select className="bg-surface-alt border border-border text-[10px] font-bold py-1 px-2.5 rounded-full text-text-secondary cursor-pointer focus:outline-none hover:bg-surface-hover transition-colors">
          <option>This Month</option>
          <option>All Time</option>
        </select>
      </div>

      {/* Donut Chart Container */}
      <div className="flex flex-col items-center justify-center py-4 relative">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full rotate-[-90deg] origin-center" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={r}
              className="fill-none stroke-surface-alt dark:stroke-border-alt"
              strokeWidth="10"
            />
            {stats.isEmpty ? (
              // Empty state stroke
              <circle
                cx="60"
                cy="60"
                r={r}
                className="fill-none stroke-stone-300 dark:stroke-stone-800"
                strokeWidth="10"
              />
            ) : (
              <>
                {/* Income / Inflow Segment (Dark Gray) */}
                {totalIncome > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={r}
                    className="fill-none stroke-stone-800 dark:stroke-stone-300 transition-all duration-500"
                    strokeWidth="10"
                    strokeDasharray={`${(stats.incomePercent / 100) * circumference} ${circumference}`}
                    strokeDashoffset={stats.incomeOffset}
                    strokeLinecap="round"
                  />
                )}
                {/* Expenses / Outflow Segment (Blue) */}
                {totalExpenses > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={r}
                    className="fill-none stroke-blue-500 dark:stroke-blue-400 transition-all duration-500"
                    strokeWidth="10"
                    strokeDasharray={`${(stats.expensePercent / 100) * circumference} ${circumference}`}
                    strokeDashoffset={stats.expenseOffset}
                    strokeLinecap="round"
                  />
                )}
              </>
            )}
          </svg>

          {/* Center Info Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total spent</span>
            <span className="text-lg font-extrabold text-text-primary mt-0.5 tracking-tight">
              {formatCurrency(totalExpenses, currencyCode)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-5 text-[10px] font-bold text-text-secondary">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500 dark:bg-blue-400 shrink-0" />
            <span>Expenses ({Math.round(stats.expensePercent)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-stone-800 dark:bg-stone-300 shrink-0" />
            <span>Income ({Math.round(stats.incomePercent)}%)</span>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 flex flex-col gap-3.5 mt-2">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">Recent Activity</span>
        
        {recentTransactions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center py-6 text-[11px] text-text-muted font-medium">
            No logged activity in this budget.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentTransactions.map((t) => {
              const catStyle = getCategoryConfig(t.parsedCategory);
              const isIncome = t.type === 'income';

              return (
                <div key={t.id} className="flex items-center justify-between p-1.5 rounded-xl hover:bg-surface-alt transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Visual Icon Box */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border text-base ${catStyle.bg} ${catStyle.border}`}>
                      {CATEGORY_EMOJIS[t.parsedCategory] || '🏷️'}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-text-primary truncate pr-1">
                        {t.parsedTitle}
                      </h4>
                      <p className="text-[9px] text-text-muted font-medium mt-0.5">
                        {t.parsedCategory} • {getRelativeTimeLabel(t.date)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-extrabold tracking-tight ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-text-primary'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(t.amount, currencyCode)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
