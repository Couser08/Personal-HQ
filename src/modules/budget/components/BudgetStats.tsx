import { IconEdit, IconCheck, IconX, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { formatCurrency } from '../utils/budgetUtils';

export function BudgetStats({
  remainingBalance,
  initialBalance,
  balanceInput,
  setBalanceInput,
  isEditingBalance,
  setIsEditingBalance,
  handleUpdateBalance,
  totalIncome,
  totalExpenses,
}: {
  remainingBalance: number;
  initialBalance: number;
  balanceInput: string;
  setBalanceInput: (val: string) => void;
  isEditingBalance: boolean;
  setIsEditingBalance: (val: boolean) => void;
  handleUpdateBalance: (e: React.FormEvent) => void;
  totalIncome: number;
  totalExpenses: number;
}) {
  return (
    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
      {/* Card 1: Available Balance */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-subtle relative overflow-hidden transition-all duration-200 hover:shadow-lifted">
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Remaining Balance
          </span>
          {!isEditingBalance ? (
            <button
              onClick={() => {
                setBalanceInput(String(initialBalance));
                setIsEditingBalance(true);
              }}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer border-none bg-transparent"
              title="Configure starting balance"
            >
              <IconEdit className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={handleUpdateBalance}
                className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer border-none bg-transparent"
                title="Confirm balance"
              >
                <IconCheck className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditingBalance(false)}
                className="p-1 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer border-none bg-transparent"
                title="Cancel edit"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {isEditingBalance ? (
          <form onSubmit={handleUpdateBalance} className="mt-2.5">
            <label className="text-[10px] text-text-muted font-medium block mb-1">Set Starting Balance ($)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                className="flex-1 text-sm bg-surface-alt border border-border-alt rounded-lg px-2.5 py-1 text-text-primary focus:outline-none focus:border-primary"
                placeholder="Starting balance"
                autoFocus
              />
            </div>
          </form>
        ) : (
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {formatCurrency(remainingBalance)}
            </span>
          </div>
        )}

        <div className="text-[10px] text-text-muted mt-2 font-medium flex items-center gap-1">
          <span>Initial Balance: {formatCurrency(initialBalance)}</span>
        </div>
      </div>

      {/* Card 2: Income */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-subtle relative overflow-hidden transition-all duration-200 hover:shadow-lifted">
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Total Income
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
            <IconTrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncome)}
          </span>
        </div>
        <p className="text-[10px] text-text-muted mt-2 font-medium">
          Sum of positive cash flow logged.
        </p>
      </div>

      {/* Card 3: Expense */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-subtle relative overflow-hidden transition-all duration-200 hover:shadow-lifted">
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Total Expenses
          </span>
          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
            <IconTrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
            {formatCurrency(totalExpenses)}
          </span>
        </div>
        <p className="text-[10px] text-text-muted mt-2 font-medium">
          Sum of negative outflows logged.
        </p>
      </div>
    </div>
  );
}
