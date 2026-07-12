import { IconPlus } from '@tabler/icons-react';
import { CustomSelect } from '../../../components/ui/CustomSelect';

export function BudgetTransactionForm({
  txType,
  setTxType,
  txTitle,
  setTxTitle,
  txAmount,
  setTxAmount,
  txCategory,
  setTxCategory,
  txDate,
  setTxDate,
  categoryOptions,
  handleAddTransaction,
}: {
  txType: 'income' | 'expense';
  setTxType: (val: 'income' | 'expense') => void;
  txTitle: string;
  setTxTitle: (val: string) => void;
  txAmount: string;
  setTxAmount: (val: string) => void;
  txCategory: string;
  setTxCategory: (val: string) => void;
  txDate: string;
  setTxDate: (val: string) => void;
  categoryOptions: Array<{ value: string; label: string }>;
  handleAddTransaction: (e: React.FormEvent) => void;
}) {
  return (
    <div className="lg:col-span-1 flex flex-col gap-6 text-left">
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-subtle flex flex-col gap-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-sm font-bold tracking-tight text-text-primary uppercase">
            Add Transaction
          </h2>
        </div>

        <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
          {/* Type Toggle Slider (Pill Control) */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">
              Flow Type
            </label>
            <div className="bg-surface-alt p-1 rounded-lg border border-border flex relative">
              <button
                type="button"
                onClick={() => setTxType('expense')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all relative z-10 cursor-pointer border-none bg-transparent ${
                  txType === 'expense'
                    ? 'text-rose-600 dark:text-rose-400 bg-surface shadow-subtle border border-border'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setTxType('income')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all relative z-10 cursor-pointer border-none bg-transparent ${
                  txType === 'income'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-surface shadow-subtle border border-border'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label
              htmlFor="tx-title"
              className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1"
            >
              Transaction Title
            </label>
            <input
              id="tx-title"
              type="text"
              value={txTitle}
              onChange={(e) => setTxTitle(e.target.value)}
              placeholder={txType === 'income' ? 'e.g. Salary Paycheck' : 'e.g. Grocery store'}
              className="w-full bg-surface-alt border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all shadow-subtle"
            />
          </div>

          {/* Amount Input */}
          <div>
            <label
              htmlFor="tx-amount"
              className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1"
            >
              Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">
                $
              </span>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface-alt border border-border rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all shadow-subtle"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <CustomSelect
              value={txCategory}
              onChange={setTxCategory}
              options={categoryOptions}
              label="Category"
              placeholder="Select Category"
            />
          </div>

          {/* Datepicker */}
          <div>
            <label
              htmlFor="tx-date"
              className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1"
            >
              Transaction Date
            </label>
            <input
              id="tx-date"
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary transition-all shadow-subtle cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 bg-primary hover:bg-primary-muted text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer shadow-subtle flex items-center justify-center gap-1.5 active:scale-[0.98] border-none"
          >
            <IconPlus className="w-4 h-4" />
            Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
