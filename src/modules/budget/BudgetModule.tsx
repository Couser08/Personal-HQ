import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconTrash, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { useAppStore, type BudgetCategory, type BudgetTransaction } from '../../store/useAppStore';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { CustomSelect } from '../../components/ui/CustomSelect';

const colorClasses = {
  rose: 'bg-rose-500 text-rose-500 border-rose-200',
  blue: 'bg-blue-500 text-blue-500 border-blue-200',
  green: 'bg-green-500 text-green-500 border-green-200',
  amber: 'bg-amber-500 text-amber-500 border-amber-200',
  purple: 'bg-purple-500 text-purple-500 border-purple-200',
};

const lightBgClasses = {
  rose: 'bg-rose-100 dark:bg-rose-900/30',
  blue: 'bg-blue-100 dark:bg-blue-900/30',
  green: 'bg-green-100 dark:bg-green-900/30',
  amber: 'bg-amber-100 dark:bg-amber-900/30',
  purple: 'bg-purple-100 dark:bg-purple-900/30',
};

export default function BudgetModule() {
  const { 
    budgetCategories, 
    budgetTransactions, 
    addBudgetCategory, 
    updateBudgetCategory, 
    deleteBudgetCategory,
    addBudgetTransaction, 
    deleteBudgetTransaction,
    showConfirm,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);

  const stats = useMemo(() => {
    const income = budgetTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = budgetTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [budgetTransactions]);

  const categorySpending = useMemo(() => {
    return budgetCategories.map(cat => {
      const spent = budgetTransactions
        .filter(t => t.categoryId === cat.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const progress = Math.min((spent / cat.budget) * 100, 100);
      return { ...cat, spent, progress };
    });
  }, [budgetCategories, budgetTransactions]);

  const hasBudgetData = budgetCategories.length > 0 || budgetTransactions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-6 h-full"
    >
      <div className="flex flex-col gap-4 justify-between items-start md:flex-row md:items-center">
        <div>
          <h2 className="flex gap-2 items-center text-2xl font-bold">
            Budget Tracker <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
          </h2>
          <p className="text-sm text-text-secondary">Manage your income and expenses</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="btn btn-secondary btn-md"
          >
            <IconPlus className="w-4 h-4" /> Category
          </button>
          <button
            onClick={() => setIsTransactionModalOpen(true)}
            className="btn btn-primary btn-md"
          >
            <IconPlus className="w-4 h-4" /> Transaction
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-surface-alt w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'overview' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'transactions' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Transactions
        </button>
      </div>

      {!hasBudgetData ? (
        <EmptyState
          icon={<IconTrendingUp className="w-9 h-9 text-text-muted" />}
          title="No budget data yet"
          description="Create categories and add transactions to see your balance, spending progress, and history."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={() => setIsCategoryModalOpen(true)} className="btn btn-secondary btn-md">
                <IconPlus className="w-4 h-4" /> Add Category
              </button>
              <button onClick={() => setIsTransactionModalOpen(true)} className="btn btn-primary btn-md">
                <IconPlus className="w-4 h-4" /> Add Transaction
              </button>
            </div>
          }
        />
      ) : (
      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <div className="flex flex-col col-span-1 gap-6 p-6 rounded-2xl border bg-surface border-border md:col-span-2 lg:col-span-3 md:flex-row">
              <div className="flex-1 space-y-4">
                <div className="flex gap-3 items-center">
                  <div className="flex justify-center items-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30">
                    <IconTrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Total Income</p>
                    <p className="text-3xl font-bold text-green-500">${stats.income.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="flex justify-center items-center w-12 h-12 bg-rose-100 rounded-xl dark:bg-rose-900/30">
                    <IconTrendingDown className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Total Expenses</p>
                    <p className="text-3xl font-bold text-rose-500">${stats.expenses.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 justify-center items-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      className="text-border"
                      strokeWidth="12"
                    />
                    {stats.income > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="12"
                        strokeDasharray={`${(stats.income / (stats.income + stats.expenses || 1)) * 251.2} 251.2`}
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                  <div className="flex absolute inset-0 flex-col justify-center items-center">
                    <p className="text-2xl font-bold">${stats.balance.toLocaleString()}</p>
                    <p className="text-sm text-text-secondary">Balance</p>
                  </div>
                </div>
              </div>
            </div>

            {categorySpending.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="flex flex-col gap-4 p-5 rounded-2xl border bg-surface border-border"
              >
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className={`w-10 h-10 rounded-xl ${lightBgClasses[cat.color]} flex items-center justify-center text-2xl`}>
                      {cat.icon}
                    </div>
                    <div>
                      <p className="font-semibold">{cat.name}</p>
                      <p className="text-sm text-text-secondary">${cat.spent.toLocaleString()} / ${cat.budget.toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => showConfirm('Delete Category', 'Are you sure you want to delete this category?', () => deleteBudgetCategory(cat.id))}
                    className="btn btn-ghost btn-sm btn-square text-text-secondary hover:text-rose-500"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-hidden relative h-2 rounded-full bg-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.progress}%` }}
                    transition={{ duration: 0.8, type: 'spring' }}
                    className={`absolute inset-y-0 left-0 ${colorClasses[cat.color].split(' ')[0]} rounded-full`}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-3"
          >
            {budgetTransactions.length === 0 ? (
              <EmptyState
                icon="💸"
                title="No transactions yet"
                description="Start tracking your income and expenses by adding your first transaction."
                action={
                  <button
                    onClick={() => setIsTransactionModalOpen(true)}
                    className="font-medium text-primary hover:underline"
                  >
                    Add your first transaction
                  </button>
                }
              />
            ) : (
              budgetTransactions.map((txn, i) => {
                const cat = budgetCategories.find(c => c.id === txn.categoryId);
                return (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex gap-4 justify-between items-center p-4 rounded-xl border bg-surface border-border"
                  >
                    <div className="flex gap-4 items-center">
                      <div className={`w-10 h-10 rounded-xl ${cat ? lightBgClasses[cat.color] : 'bg-surface-alt'} flex items-center justify-center text-2xl`}>
                        {cat?.icon || '💸'}
                      </div>
                      <div>
                        <p className="font-medium">{txn.description}</p>
                        <p className="text-sm text-text-secondary">{cat?.name || 'Unknown'} • {new Date(txn.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <p className={`font-bold ${txn.type === 'income' ? 'text-green-500' : 'text-rose-500'}`}>
                        {txn.type === 'income' ? '+' : '-'}$${txn.amount.toLocaleString()}
                      </p>
                      <button
                        onClick={() => showConfirm('Delete Transaction', 'Are you sure you want to delete this transaction?', () => deleteBudgetTransaction(txn.id))}
                        className="btn btn-ghost btn-sm btn-square text-text-secondary hover:text-rose-500"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
      )}

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}
        title={editingCategory ? 'Edit Category' : 'New Category'}
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={async (data) => {
            if (editingCategory) {
              await updateBudgetCategory(editingCategory.id, data);
            } else {
              await addBudgetCategory({ ...data, id: crypto.randomUUID() });
            }
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title="New Transaction"
      >
        <TransactionForm
          categories={budgetCategories}
          onSubmit={async (data) => {
            await addBudgetTransaction({ ...data, id: crypto.randomUUID(), date: new Date().toISOString() });
            setIsTransactionModalOpen(false);
          }}
        />
      </Modal>
    </motion.div>
  );
}

function CategoryForm({ 
  category, 
  onSubmit 
}: { 
  category: BudgetCategory | null; 
  onSubmit: (data: Omit<BudgetCategory, 'id'>) => Promise<void>;
}) {
  const [name, setName] = useState(category?.name || '');
  const [budget, setBudget] = useState(category?.budget.toString() || '');
  const [color, setColor] = useState(category?.color || 'rose');
  const [icon, setIcon] = useState(category?.icon || '💰');

  const icons = ['💰', '🍔', '🚗', '🎮', '🛒', '💼', '🏠', '✈️', '🎓', '💊'];
  const colors = ['rose', 'blue', 'green', 'amber', 'purple'] as const;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({ name, budget: parseFloat(budget), color, icon });
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-secondary">Category Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface-alt border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-secondary">Budget</label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full bg-surface-alt border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-secondary">Color</label>
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-full border-2 transition-colors ${
                colorClasses[c].split(' ')[0]} ${color === c ? 'border-border-alt scale-110' : 'border-transparent hover:scale-105'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-secondary">Icon</label>
        <div className="flex flex-wrap gap-2">
          {icons.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-colors ${
                icon === i ? 'bg-surface-alt border-2 border-primary scale-110' : 'bg-surface border border-border hover:scale-105'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" className="btn btn-secondary btn-md">Cancel</button>
        <button type="submit" className="btn btn-primary btn-md">Save</button>
      </div>
    </form>
  );
}

function TransactionForm({ 
  categories, 
  onSubmit 
}: { 
  categories: BudgetCategory[]; 
  onSubmit: (data: Omit<BudgetTransaction, 'id' | 'date'>) => Promise<void>;
}) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({ categoryId, amount: parseFloat(amount), description, type });
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex gap-1 p-1 rounded-xl bg-surface-alt">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            type === 'expense' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            type === 'income' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Income
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-secondary">Category</label>
        <CustomSelect
          value={categoryId}
          onChange={val => setCategoryId(val)}
          options={categories.map(cat => ({ value: cat.id, label: `${cat.icon} ${cat.name}` }))}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-secondary">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-surface-alt border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-secondary">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-surface-alt border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          required
        />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" className="btn btn-secondary btn-md">Cancel</button>
        <button type="submit" className="btn btn-primary btn-md">Add Transaction</button>
      </div>
    </form>
  );
}
