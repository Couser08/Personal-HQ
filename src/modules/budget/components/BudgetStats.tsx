import { useState } from 'react';
import { IconDotsVertical, IconCheck, IconX, IconTrendingDown, IconPlus } from '@tabler/icons-react';
import { formatCurrency, getCurrencySymbol } from '../utils/budgetUtils';

export function BudgetStats({
  remainingBalance,
  initialBalance,
  balanceInput,
  setBalanceInput,
  isEditingBalance,
  setIsEditingBalance,
  handleUpdateBalance,
  totalExpenses,
  currencyCode,
  activeCategoryFilter,
  setActiveCategoryFilter,
  onAddTransactionClick,
}: {
  remainingBalance: number;
  initialBalance: number;
  balanceInput: string;
  setBalanceInput: (val: string) => void;
  isEditingBalance: boolean;
  setIsEditingBalance: (val: boolean) => void;
  handleUpdateBalance: (e: React.FormEvent) => void;
  totalExpenses: number;
  currencyCode: string;
  activeCategoryFilter: string;
  setActiveCategoryFilter: (category: string) => void;
  onAddTransactionClick: () => void;
}) {
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);

  // Compute budget spent percentage
  const spentPercentage = initialBalance > 0 
    ? Math.min(Math.round((totalExpenses / initialBalance) * 100), 100) 
    : 0;

  // Currencies list for display
  const currencySymbol = getCurrencySymbol(currencyCode);

  // Categories list for quick pills (similar to Transfer, Utility, Taxes, Transport)
  const quickCategories = [
    { name: 'All', icon: '⚡' },
    { name: 'Food & Dining', icon: '🍔' },
    { name: 'Rent & Bills', icon: '🏠' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Taxes', icon: '📝' },
    { name: 'Transport', icon: '🚗' },
    { name: 'Subscriptions', icon: '🔄' },
  ];

  return (
    <div className="lg:col-span-2 flex flex-col gap-6 text-left">
      {/* Balances Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Card 1: Obsidian Available Balance Card */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-neutral-900 via-neutral-950 to-stone-900 text-stone-100 border border-neutral-800/80 p-6 shadow-lifted transition-all duration-300 hover:shadow-high hover:-translate-y-0.5 group">
          {/* Subtle Cupertino Map/Wave Background Pattern */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none select-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path d="M-20 60 C30 80, 80 40, 120 70 C160 100, 200 50, 250 80 C300 110, 320 80, 360 90" fill="none" stroke="white" strokeWidth="1.5" />
              <path d="M-20 80 C40 100, 90 60, 140 90 C190 120, 220 70, 270 100 C320 130, 340 90, 380 110" fill="none" stroke="white" strokeWidth="1" />
              <circle cx="280" cy="40" r="60" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 3" />
            </svg>
          </div>

          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Available Balance
            </span>
            
            {/* Options Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-100 hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
              >
                <IconDotsVertical className="w-4 h-4" />
              </button>
              {showOptionsDropdown && (
                <div className="absolute right-0 mt-1.5 w-40 bg-neutral-900 border border-neutral-800 rounded-xl shadow-high py-1 z-50 text-xs">
                  <button
                    onClick={() => {
                      setBalanceInput(String(initialBalance));
                      setIsEditingBalance(true);
                      setShowOptionsDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-stone-300 hover:bg-neutral-800 hover:text-white border-none bg-transparent cursor-pointer font-medium"
                  >
                    Adjust Initial Balance
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Amount Display */}
          <div className="mt-5 relative z-10 min-h-[64px] flex flex-col justify-end">
            {isEditingBalance ? (
              <form onSubmit={handleUpdateBalance} className="w-full flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(e.target.value)}
                    className="w-full text-lg font-bold bg-neutral-800/80 border border-neutral-700 rounded-xl pl-7 pr-3 py-1.5 text-stone-100 focus:outline-none focus:border-blue-500"
                    placeholder="Starting balance"
                    autoFocus
                  />
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer border-none"
                    title="Confirm balance"
                  >
                    <IconCheck className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingBalance(false)}
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-stone-300 transition-colors cursor-pointer border-none"
                    title="Cancel edit"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <span className="text-3xl font-extrabold tracking-tight text-white">
                  {formatCurrency(remainingBalance, currencyCode)}
                </span>
                <p className="text-[9px] text-stone-400 mt-1 font-semibold flex items-center gap-1">
                  <span>Initial Balance: {formatCurrency(initialBalance, currencyCode)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Card branding footer */}
          <div className="mt-8 flex justify-between items-center text-stone-500 text-[10px] font-semibold tracking-wider relative z-10 border-t border-white/5 pt-3.5">
            <span>•••• 2026</span>
            <span className="text-stone-300 uppercase tracking-widest text-[9px] font-bold">FocusFlow</span>
          </div>
        </div>

        {/* Card 2: Ivory Frosted Expenses Card */}
        <div className="relative overflow-hidden rounded-[24px] bg-white dark:bg-stone-900/60 border border-border dark:border-border-alt p-6 shadow-lifted transition-all duration-300 hover:shadow-high hover:-translate-y-0.5 group">
          {/* Subtle Contour lines */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none select-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path d="M-10 40 C40 60, 90 20, 130 50 C170 80, 210 30, 260 60 C310 90, 330 60, 370 70" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M-10 100 C30 80, 70 120, 120 90 C170 60, 210 110, 250 80 C290 50, 330 90, 370 70" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>

          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Monthly Expenses
            </span>
            <div className="flex items-center gap-1.5 py-0.5 px-2 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 text-[9px] font-bold">
              <IconTrendingDown className="w-3 h-3" />
              <span>Outflow</span>
            </div>
          </div>

          {/* Amount Display */}
          <div className="mt-5 relative z-10 min-h-[64px] flex flex-col justify-end">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {formatCurrency(totalExpenses, currencyCode)}
            </span>
            
            {/* Progress Bar showing spent vs initial */}
            <div className="mt-2.5 w-full flex flex-col gap-1">
              <div className="flex justify-between text-[8px] font-bold text-text-muted">
                <span>Budget Spent</span>
                <span>{spentPercentage}%</span>
              </div>
              <div className="w-full bg-surface-alt border border-border rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${spentPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card branding footer */}
          <div className="mt-4 flex justify-between items-center text-text-muted text-[10px] font-semibold tracking-wider relative z-10 border-t border-border dark:border-border-alt/5 pt-3.5">
            <span>•••• 4321</span>
            <span className="text-text-primary uppercase tracking-widest text-[9px] font-bold">Limit Active</span>
          </div>
        </div>
      </div>

      {/* Quick Actions & Filters Bar */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">Quick Actions</span>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none scroll-smooth">
          {/* Add Tx Pill Button (Cupertino blue) */}
          <button
            onClick={onAddTransactionClick}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors shadow-subtle cursor-pointer active:scale-95 border-none shrink-0"
          >
            <IconPlus className="w-3.5 h-3.5" />
            <span>Add Tx</span>
          </button>

          {/* Divider */}
          <div className="h-5 w-[1px] bg-border shrink-0 mx-1" />

          {/* Category Filter Pills */}
          {quickCategories.map((cat) => {
            const isSelected = activeCategoryFilter === cat.name || (cat.name === 'All' && activeCategoryFilter === 'all');
            
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategoryFilter(cat.name === 'All' ? 'all' : cat.name)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer active:scale-95 shrink-0 shadow-subtle ${
                  isSelected
                    ? 'bg-stone-900 text-stone-100 border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100'
                    : 'bg-surface text-text-secondary border-border hover:bg-surface-hover'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
