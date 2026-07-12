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
}) {
  return (
    <div className="lg:col-span-2 flex flex-col gap-4 text-left">
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-subtle flex flex-col gap-4 h-full min-h-[500px]">
        {/* List Header controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-text-primary uppercase">
              Recent Ledger
            </h2>
            <p className="text-[10px] text-text-muted font-medium mt-0.5">
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
            Filter Type:
          </span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border-none ${
              filterType === 'all'
                ? 'bg-text-primary text-background'
                : 'bg-surface-alt text-text-secondary border border-border hover:bg-surface-hover'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border-none ${
              filterType === 'income'
                ? 'bg-emerald-600 text-white'
                : 'bg-surface-alt text-text-secondary border border-border hover:bg-surface-hover'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border-none ${
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

        {/* Ledger Transactions list container */}
        <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 mt-2">
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
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-alt hover:bg-surface-hover/80 border border-border transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Emoji Badge icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border text-base ${catStyle.bg} ${catStyle.border}`}>
                          {CATEGORY_EMOJIS[t.parsedCategory] || '🏷️'}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-text-primary truncate pr-1">
                            {t.parsedTitle}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wide ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                              {t.parsedCategory}
                            </span>
                            <span className="text-[9px] text-text-muted font-medium">
                              {new Date(t.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 pl-2 shrink-0">
                        <span
                          className={`text-xs font-extrabold tracking-tight ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(t.amount)}
                        </span>

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
