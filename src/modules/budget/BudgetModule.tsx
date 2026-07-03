import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconPlus, IconTrash, IconTrendingUp, IconTrendingDown, 
  IconEdit, IconFilter, IconWallet, IconSettings,
  IconCoin, IconBuildingStore, IconCar, IconDeviceGamepad2,
  IconShoppingCart, IconBriefcase, IconHome, IconPlane,
  IconSchool, IconPill, IconShirt, IconDeviceDesktop,
  IconBulb, IconBarbell, IconBook, IconCoffee
} from '@tabler/icons-react';

const ICON_MAP: Record<string, React.ElementType> = {
  '💰': IconCoin,
  '🍔': IconBuildingStore,
  '🚗': IconCar,
  '🎮': IconDeviceGamepad2,
  '🛒': IconShoppingCart,
  '💼': IconBriefcase,
  '🏠': IconHome,
  '✈️': IconPlane,
  '🎓': IconSchool,
  '💊': IconPill,
  '💅': IconShirt,
  '🍿': IconDeviceDesktop,
  '💡': IconBulb,
  '🏋️': IconBarbell,
  '📚': IconBook,
  '☕': IconCoffee,
};

const renderIcon = (iconKey: string, className = "w-5 h-5") => {
  const IconComponent = ICON_MAP[iconKey];
  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  // Fallback for existing emoji icons
  return <span className="text-lg leading-none">{iconKey}</span>;
};
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
    settings,
    updateSettings,
    budgetCategories, 
    budgetTransactions, 
    addBudgetCategory, 
    updateBudgetCategory, 
    deleteBudgetCategory,
    addBudgetTransaction, 
    updateBudgetTransaction,
    deleteBudgetTransaction,
    showConfirm,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<BudgetTransaction | null>(null);

  // Filters state
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');

  const stats = useMemo(() => {
    let bankIncome = 0;
    let bankExpenses = 0;
    let cashIncome = 0;
    let cashExpenses = 0;

    budgetTransactions.forEach(t => {
      if (t.type === 'income') {
        if (t.paymentMethod === 'cash') cashIncome += t.amount;
        else bankIncome += t.amount;
      } else {
        if (t.paymentMethod === 'cash') cashExpenses += t.amount;
        else bankExpenses += t.amount;
      }
    });

    const income = bankIncome + cashIncome;
    const expenses = bankExpenses + cashExpenses;
    
    return {
      income,
      expenses,
      bankBalance: (settings.initialBankBalance || 0) + bankIncome - bankExpenses,
      cashBalance: (settings.initialCashBalance || 0) + cashIncome - cashExpenses,
      totalBalance: (settings.initialBankBalance || 0) + (settings.initialCashBalance || 0) + income - expenses,
    };
  }, [budgetTransactions, settings.initialBankBalance, settings.initialCashBalance]);

  const categorySpending = useMemo(() => {
    return budgetCategories.map(cat => {
      const spent = budgetTransactions
        .filter(t => t.categoryId === cat.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const progress = Math.min((spent / (cat.budget || 1)) * 100, 100);
      return { ...cat, spent, progress };
    });
  }, [budgetCategories, budgetTransactions]);

  // Extract unique transaction months for month filter dropdown
  const uniqueMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    budgetTransactions.forEach(t => {
      const date = new Date(t.date);
      const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthsSet.add(label);
    });
    return Array.from(monthsSet);
  }, [budgetTransactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return budgetTransactions.filter(t => {
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCategory = filterCategory === 'all' || t.categoryId === filterCategory;
      
      let matchesMonth = true;
      if (filterMonth !== 'all') {
        const tMonthLabel = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        matchesMonth = tMonthLabel === filterMonth;
      }
      
      return matchesType && matchesCategory && matchesMonth;
    });
  }, [budgetTransactions, filterType, filterCategory, filterMonth]);

  const hasBudgetData = budgetCategories.length > 0 || budgetTransactions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col gap-6 h-full pb-10"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 justify-between items-start md:flex-row md:items-center border-b border-border pb-4">
        <div>
          <h2 className="flex gap-2 items-center text-2xl font-bold">
            Expense & Income Tracker <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary"></span>
          </h2>
          <p className="text-sm text-text-secondary">Track cash flow, set category budgets, and monitor balance metrics.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="btn btn-secondary btn-md rounded-full px-4"
          >
            <IconSettings className="w-4 h-4" /> Settings
          </button>
          <button
            onClick={() => {
              setEditingCategory(null);
              setIsCategoryModalOpen(true);
            }}
            className="btn btn-secondary btn-md rounded-full px-4 hidden md:flex"
          >
            <IconPlus className="w-4 h-4" /> Add Category
          </button>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(true);
            }}
            className="btn btn-primary btn-md rounded-full px-5"
          >
            <IconPlus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-surface-alt border border-border/40 w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'overview' ? 'bg-surface text-text-primary shadow-md' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'transactions' ? 'bg-surface text-text-primary shadow-md' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Transactions Ledger ({filteredTransactions.length})
        </button>
      </div>

      {!hasBudgetData ? (
        <EmptyState
          icon={<IconWallet className="w-9 h-9 text-text-muted" />}
          title="No transactions yet"
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
              {/* Financial Dashboard Widget */}
              <div className="flex flex-col col-span-1 gap-6 p-6 rounded-[28px] border bg-surface/50 border-border/80 lg:col-span-3 lg:flex-row items-center justify-between backdrop-blur-md">
                
                {/* Balances */}
                <div className="flex flex-col gap-4 w-full lg:w-1/3">
                  <div className="flex justify-between items-center p-4 bg-surface border border-border/60 rounded-2xl">
                    <div>
                      <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Bank Balance</p>
                      <p className={`text-xl font-black ${stats.bankBalance >= 0 ? 'text-blue-500' : 'text-rose-500'}`}>${stats.bankBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <IconWallet className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-surface border border-border/60 rounded-2xl">
                    <div>
                      <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Cash Balance</p>
                      <p className={`text-xl font-black ${stats.cashBalance >= 0 ? 'text-green-500' : 'text-rose-500'}`}>${stats.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl leading-none">💵</span>
                    </div>
                  </div>
                </div>

                {/* Center Net Balance */}
                <div className="flex flex-col items-center justify-center text-center p-6 bg-surface-alt border border-border/40 rounded-[24px] min-w-[240px] flex-1 lg:flex-none">
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1">Total Net Balance</p>
                  <p className={`text-4xl font-black tracking-tight ${stats.totalBalance >= 0 ? 'text-text-primary' : 'text-rose-500'}`}>
                    ${stats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold mt-2 ${
                    stats.totalBalance >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {stats.totalBalance >= 0 ? '✓ In Surplus' : '⚠ In Deficit'}
                  </span>
                </div>

                {/* Income / Expense */}
                <div className="flex flex-col gap-4 w-full lg:w-1/3">
                  <div className="flex justify-between items-center p-4 bg-surface border border-border/60 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <IconTrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Income</p>
                        <p className="text-lg font-black text-text-primary">${stats.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-surface border border-border/60 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-rose-500/10 rounded-lg flex items-center justify-center">
                        <IconTrendingDown className="w-4 h-4 text-rose-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Expenses</p>
                        <p className="text-lg font-black text-text-primary">${stats.expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories list */}
              {categorySpending.map((cat) => (
                <div
                  key={cat.id}
                  className="flex flex-col gap-4 p-5 rounded-[24px] border bg-surface border-border hover:shadow-md transition-shadow relative group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div className={`w-11 h-11 rounded-xl ${lightBgClasses[cat.color as keyof typeof lightBgClasses]} flex items-center justify-center text-2xl border border-border/20`}>
                        {renderIcon(cat.icon, `w-6 h-6 text-${cat.color}-500`)}
                      </div>
                      <div>
                        <p className="font-bold text-text-primary text-[15px]">{cat.name}</p>
                        <p className="text-xs text-text-muted">
                          ${cat.spent.toLocaleString()} spent {cat.budget ? `/ $${cat.budget.toLocaleString()} limit` : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsCategoryModalOpen(true);
                        }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-primary bg-surface-alt border border-border/50 transition-colors"
                        title="Edit Category"
                      >
                        <IconEdit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => showConfirm('Delete Category', 'Delete this category and all its transactions?', () => deleteBudgetCategory(cat.id))}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-rose-500 bg-surface-alt border border-border/50 transition-colors"
                        title="Delete Category"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {cat.budget > 0 && (
                    <div className="space-y-1">
                      <div className="overflow-hidden relative h-1.5 rounded-full bg-border-alt">
                        <div
                          className={`absolute inset-y-0 left-0 ${colorClasses[cat.color].split(' ')[0]} rounded-full transition-all duration-500`}
                          style={{ width: `${cat.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-bold text-text-secondary">
                        <span>SPENT BUDGET</span>
                        <span className={cat.progress >= 90 ? 'text-rose-500' : ''}>{Math.round(cat.progress)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4"
            >
              {/* Dynamic Filter Panel */}
              <div className="bg-surface-alt border border-border/50 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest mr-2 flex items-center gap-1">
                    <IconFilter className="w-3 h-3" /> Filters
                  </span>
                  
                  {/* Type Filter Buttons */}
                  <div className="flex gap-1 bg-surface p-1 rounded-xl border border-border/50">
                    {([
                      { id: 'all', label: 'All' },
                      { id: 'expense', label: 'Expenses' },
                      { id: 'income', label: 'Income' }
                    ] as const).map(t => (
                      <button
                        key={t.id}
                        onClick={() => setFilterType(t.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                          filterType === t.id ? 'bg-surface-alt text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  {/* Category Filter */}
                  <div className="flex-1 md:w-48">
                    <CustomSelect
                      value={filterCategory}
                      onChange={setFilterCategory}
                      options={[
                        { value: 'all', label: 'All Categories' },
                        ...budgetCategories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))
                      ]}
                    />
                  </div>

                  {/* Month Filter */}
                  <div className="flex-1 md:w-40">
                    <CustomSelect
                      value={filterMonth}
                      onChange={setFilterMonth}
                      options={[
                        { value: 'all', label: 'All Months' },
                        ...uniqueMonths.map(m => ({ value: m, label: m }))
                      ]}
                    />
                  </div>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <EmptyState
                  icon="💸"
                  title="No matching transactions"
                  description="Try adjusting your dynamic filters to view ledger records."
                  action={
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setFilterCategory('all');
                        setFilterMonth('all');
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Clear Filters
                    </button>
                  }
                />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {filteredTransactions.map((txn) => {
                    const cat = budgetCategories.find(c => c.id === txn.categoryId);
                    return (
                      <div
                        key={txn.id}
                        className="flex gap-4 justify-between items-center p-4 rounded-2xl border bg-surface border-border/80 hover:border-primary/20 transition-all group"
                      >
                        <div className="flex gap-4 items-center min-w-0">
                          <div className={`w-10 h-10 rounded-xl ${cat ? lightBgClasses[cat.color as keyof typeof lightBgClasses] : 'bg-surface-alt'} flex items-center justify-center text-xl shrink-0 border border-border/20`}>
                            {cat ? renderIcon(cat.icon, `w-5 h-5 text-${cat.color}-500`) : <span className="text-xl">💸</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-text-primary text-[14px] truncate">{txn.description}</p>
                            <p className="text-[10px] text-text-secondary font-medium">
                              {cat?.name || 'Unassigned'} • {new Date(txn.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 items-center shrink-0">
                          <p className={`font-black text-sm tracking-tight ${txn.type === 'income' ? 'text-green-500' : 'text-rose-500'}`}>
                            {txn.type === 'income' ? '+' : '-'}${txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingTransaction(txn);
                                setIsTransactionModalOpen(true);
                              }}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-primary bg-surface-alt border border-border/50 transition-colors"
                              title="Edit Record"
                            >
                              <IconEdit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => showConfirm('Delete Record', 'Delete this ledger transaction entry?', () => deleteBudgetTransaction(txn.id))}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-rose-500 bg-surface-alt border border-border/50 transition-colors"
                              title="Delete Record"
                            >
                              <IconTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Category Modal Overlay */}
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
          onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}
        />
      </Modal>

      {/* Transaction Modal Overlay */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => { setIsTransactionModalOpen(false); setEditingTransaction(null); }}
        title={editingTransaction ? 'Edit Transaction' : 'New Transaction'}
      >
        <TransactionForm
          categories={budgetCategories}
          transaction={editingTransaction}
          onSubmit={async (data) => {
            if (editingTransaction) {
              await updateBudgetTransaction(editingTransaction.id, data);
            } else {
              await addBudgetTransaction({ ...data, id: crypto.randomUUID(), date: new Date().toISOString() });
            }
            setIsTransactionModalOpen(false);
            setEditingTransaction(null);
          }}
          onClose={() => { setIsTransactionModalOpen(false); setEditingTransaction(null); }}
        />
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Budget Settings"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const initialBankBalance = parseFloat(formData.get('initialBankBalance') as string) || 0;
            const initialCashBalance = parseFloat(formData.get('initialCashBalance') as string) || 0;
            updateSettings({ initialBankBalance, initialCashBalance });
            setIsSettingsModalOpen(false);
          }}
          className="flex flex-col gap-4 text-left"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Initial Bank Balance ($)</label>
            <input
              name="initialBankBalance"
              type="number"
              step="0.01"
              defaultValue={settings.initialBankBalance || 0}
              className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Initial Cash Balance ($)</label>
            <input
              name="initialCashBalance"
              type="number"
              step="0.01"
              defaultValue={settings.initialCashBalance || 0}
              className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
              required
            />
          </div>
          <div className="flex gap-2.5 justify-end pt-3 border-t border-border/40 mt-2">
            <button type="button" onClick={() => setIsSettingsModalOpen(false)} className="btn btn-secondary btn-md rounded-full px-5">Cancel</button>
            <button type="submit" className="btn btn-primary btn-md rounded-full px-6">Save Settings</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}

function CategoryForm({ 
  category, 
  onSubmit,
  onClose
}: { 
  category: BudgetCategory | null; 
  onSubmit: (data: Omit<BudgetCategory, 'id'>) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(category?.name || '');
  const [budget, setBudget] = useState(category?.budget ? category.budget.toString() : '');
  const [color, setColor] = useState<BudgetCategory['color']>(category?.color || 'rose');
  const [icon, setIcon] = useState(category?.icon || '💰');

  const icons = ['💰', '🍔', '🚗', '🎮', '🛒', '💼', '🏠', '✈️', '🎓', '💊', '💅', '🍿', '💡', '🏋️', '📚'];
  const colors = ['rose', 'blue', 'green', 'amber', 'purple'] as const;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({ name, budget: budget ? parseFloat(budget) : 0, color, icon });
      }}
      className="flex flex-col gap-4 text-left"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Category Name</label>
        <input
          type="text"
          value={name}
          placeholder="e.g. Dining Out, Utilities"
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Monthly Budget Limit (Optional)</label>
        <input
          type="number"
          value={budget}
          placeholder="e.g. 500"
          onChange={(e) => setBudget(e.target.value)}
          className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Accent Color</label>
        <div className="flex gap-2.5">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-9 h-9 rounded-full border-2 transition-all ${
                colorClasses[c].split(' ')[0]} ${color === c ? 'border-text-primary scale-110 shadow-sm' : 'border-transparent hover:scale-105'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Select Icon</label>
        <div className="flex flex-wrap gap-2">
          {icons.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                icon === i ? 'bg-surface-alt border border-primary scale-110 shadow-sm' : 'bg-surface border border-border/80 hover:scale-105'
              }`}
            >
              {renderIcon(i, "w-5 h-5")}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2.5 justify-end pt-3 border-t border-border/40 mt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary btn-md rounded-full px-5">Cancel</button>
        <button type="submit" className="btn btn-primary btn-md rounded-full px-6">Save Category</button>
      </div>
    </form>
  );
}

function TransactionForm({ 
  categories, 
  transaction,
  onSubmit,
  onClose
}: { 
  categories: BudgetCategory[]; 
  transaction: BudgetTransaction | null;
  onSubmit: (data: Omit<BudgetTransaction, 'id' | 'date'>) => Promise<void>;
  onClose: () => void;
}) {
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || categories[0]?.id || '');
  const [amount, setAmount] = useState(transaction?.amount ? transaction.amount.toString() : '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>(transaction?.paymentMethod || 'online');

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({ categoryId, amount: parseFloat(amount), description, type, paymentMethod });
      }}
      className="flex flex-col gap-4 text-left"
    >
      {/* Type toggle */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-surface-alt border border-border/40">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            type === 'expense' ? 'bg-surface text-rose-500 shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            type === 'income' ? 'bg-surface text-green-500 shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Income
        </button>
      </div>

      {/* Payment Method toggle */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-surface-alt border border-border/40">
        <button
          type="button"
          onClick={() => setPaymentMethod('online')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            paymentMethod === 'online' ? 'bg-surface text-blue-500 shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Online (Bank/UPI)
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod('cash')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            paymentMethod === 'cash' ? 'bg-surface text-green-500 shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Cash
        </button>
      </div>
      
      {/* Category Select */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Category</label>
        <CustomSelect
          value={categoryId}
          onChange={val => setCategoryId(val)}
          options={categories.map(cat => ({ value: cat.id, label: `${cat.icon} ${cat.name}` }))}
        />
      </div>

      {/* Amount input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Amount ($)</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          placeholder="0.00"
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
          required
        />
      </div>

      {/* Description input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Description</label>
        <input
          type="text"
          value={description}
          placeholder="e.g. Grocery shopping, Weekly wage"
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
          required
        />
      </div>
      
      {/* Footer buttons */}
      <div className="flex gap-2.5 justify-end pt-3 border-t border-border/40 mt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary btn-md rounded-full px-5">Cancel</button>
        <button type="submit" className="btn btn-primary btn-md rounded-full px-6">
          {transaction ? 'Save Changes' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
}
