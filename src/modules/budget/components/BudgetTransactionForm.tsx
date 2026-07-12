import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconX } from '@tabler/icons-react';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { getCurrencySymbol } from '../utils/budgetUtils';

export function BudgetTransactionForm({
  isOpen,
  onClose,
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
  currencyCode,
}: {
  isOpen: boolean;
  onClose: () => void;
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
  currencyCode: string;
}) {
  const currencySymbol = getCurrencySymbol(currencyCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddTransaction(e);
    
    if (txTitle.trim() && txAmount && Number(txAmount) > 0 && txCategory && txDate) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 ">
          {/* Frosted Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-pointer bg-black/40 backdrop-blur-xs"
          />

          {/* Cupertino Modal Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 26, stiffness: 290 }}
            /* FIX: Changed max-h-[90vh] to max-h-[85dvh] for mobile browsers */
            className="relative w-full sm:w-[600px] sm:max-w-[90vw] bg-surface border border-border sm:rounded-[24px] rounded-t-[24px] p-6 shadow-high z-10 text-left overflow-hidden flex flex-col gap-4 max-h-[85dvh] sm:max-h-none"
          >
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 mx-auto mb-1 rounded-full bg-border dark:bg-border-alt sm:hidden shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
              <h2 className="text-sm font-bold tracking-tight uppercase text-text-primary">
                Add Transaction
              </h2>
              <button
                onClick={onClose}
                className="p-1 transition-all bg-transparent border-none rounded-lg cursor-pointer text-text-muted hover:text-text-primary hover:bg-surface-hover active:scale-95"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            {/* FIX: Added pb-4 so the scroll goes slightly past the button */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-4 pr-1 overflow-y-auto">
              {/* Type Toggle Slider (Pill Control) */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">
                  Flow Type
                </label>
                <div className="relative flex p-1 border bg-surface-alt rounded-xl border-border">
                  <button
                    type="button"
                    onClick={() => setTxType('expense')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative z-10 cursor-pointer border-none bg-transparent ${
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
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative z-10 cursor-pointer border-none bg-transparent ${
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
                  autoFocus
                />
              </div>

              {/* Amount Input */}
              <div>
                <label
                  htmlFor="tx-amount"
                  className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1"
                >
                  Amount ({currencyCode})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">
                    {currencySymbol}
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
              {/* FIX: Added shrink-0 so flexbox doesn't crush the button */}
              <button
                type="submit"
                className="shrink-0 w-full mt-2 bg-primary hover:bg-primary-muted text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer shadow-subtle flex items-center justify-center gap-1.5 active:scale-[0.98] border-none"
              >
                <IconPlus className="w-4 h-4" />
                Add Transaction
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}