import { motion, AnimatePresence } from 'framer-motion';
import { IconSearch, IconHistory, IconTrash } from '@tabler/icons-react';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { CATEGORY_EMOJIS, getCategoryConfig, formatCurrency } from '../utils/budgetUtils';

export function BudgetTransactionList({
  filteredTransactions,
  parsedTransactionsLength,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  filterCategoryOptions,
  handleDelete,
  currencyCode,
}: {
  filteredTransactions: any[];
  parsedTransactionsLength: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterType: 'all' | 'income' | 'expense';
  setFilterType: (val: 'all' | 'income' | 'expense') => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterCategoryOptions: Array<{ value: string; label: string }>;
  handleDelete: (id: string) => void;
  currencyCode: string;
}) {
  return (
    <div className="lg:col-span-2 flex flex-col gap-4 text-left h-full">
      <div className="bg-surface border border-border rounded-[24px] p-5 shadow-subtle flex flex-col gap-4 h-full min-h-[500px]">
        {/* List Header controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-text-primary uppercase">
              Recent Ledger
            </h2>
            <p className="text-[10px] text-text-muted font-bold mt-0.5">
              Showing {filteredTransactions.length} of {parsedTransactionsLength} items
            </p>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-60">
            <IconSearch className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ledger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-full pl-9 pr-3.5 py-1.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all shadow-subtle"
            />
          </div>
        </div>

        {/* List Filters row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mr-1">
            Flow Type:
          </span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer border-none shadow-subtle ${
              filterType === 'all'
                ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900'
                : 'bg-surface-alt text-text-secondary border border-border hover:bg-surface-hover'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer border-none shadow-subtle ${
              filterType === 'income'
                ? 'bg-emerald-600 text-white'
                : 'bg-surface-alt text-text-secondary border border-border hover:bg-surface-hover'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer border-none shadow-subtle ${
              filterType === 'expense'
                ? 'bg-rose-600 text-white'
                : 'bg-surface-alt text-text-secondary border border-border hover:bg-surface-hover'
            }`}
          >
            Expenses
          </button>

          <div className="h-4 w-[1px] bg-border mx-1" />

          <div className="flex items-center gap-1.5">
            <CustomSelect
              value={filterCategory}
              onChange={setFilterCategory}
              options={filterCategoryOptions}
              placeholder="All Categories"
              className="w-44"
            />
          </div>
        </div>

        {/* Table Headers (Recent Sales table style) */}
        <div className="grid grid-cols-4 sm:grid-cols-5 text-[9px] font-bold text-text-muted uppercase tracking-wider px-3 mt-4 mb-1">
          <span className="col-span-2">Transaction</span>
          <span>Date</span>
          <span>Status</span>
          <span className="text-right pr-4">Amount</span>
        </div>

        {/* Ledger Transactions list container */}
        <div className="flex-1 overflow-y-auto max-h-[460px] pr-1">
          <AnimatePresence initial={false}>
            {filteredTransactions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="p-3 rounded-full bg-surface-alt border border-border mb-3 text-text-muted">
                  <IconHistory className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-text-primary">
                  No matching records
                </span>
                <p className="text-[10px] text-text-muted max-w-[200px] mt-1">
                  {searchQuery || filterType !== 'all' || filterCategory !== 'all'
                    ? 'Try clearing your filters or search terms.'
                    : 'Your financial history is empty. Logs will appear here.'}
                </p>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredTransactions.map((t) => {
                  const catStyle = getCategoryConfig(t.parsedCategory);
                  const isIncome = t.type === 'income';

                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-4 sm:grid-cols-5 items-center p-3 rounded-2xl bg-surface-alt/70 hover:bg-surface-hover/80 border border-transparent hover:border-border transition-all duration-150 group"
                    >
                      {/* Transaction Column (Emoji + Title + Category subtext) */}
                      <div className="col-span-2 flex items-center gap-3 min-w-0">
                        {/* Emoji Badge icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border text-base ${catStyle.bg} ${catStyle.border}`}>
                          {CATEGORY_EMOJIS[t.parsedCategory] || '🏷️'}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-text-primary truncate pr-1">
                            {t.parsedTitle}
                          </h4>
                          <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block mt-0.5">
                            {t.parsedCategory}
                          </span>
                        </div>
                      </div>

                      {/* Date Column */}
                      <span className="text-[10px] text-text-muted font-semibold">
                        {new Date(t.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>

                      {/* Status Column (Green Success badge for Income, Gray Process for Expense) */}
                      <div>
                        {isIncome ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                            • Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700/50">
                            • Process
                          </span>
                        )}
                      </div>

                      {/* Amount Column */}
                      <div className="flex items-center justify-end gap-2 pl-2 shrink-0">
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

                        {/* Hover delete button */}
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer duration-150 border-none bg-transparent"
                          title="Delete log"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
