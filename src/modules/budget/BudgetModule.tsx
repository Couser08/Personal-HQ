import { useState, useEffect, useMemo } from 'react';
import { IconWallet, IconTrash } from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import { BudgetStats } from './components/BudgetStats';
import { BudgetTransactionForm } from './components/BudgetTransactionForm';
import { BudgetTransactionList } from './components/BudgetTransactionList';
import { BudgetStatsDonut } from './components/BudgetStatsDonut';
import { CATEGORY_EMOJIS, getCurrencySymbol } from './utils/budgetUtils';

export default function BudgetModule() {
  const {
    selectedCurrency,
    setSelectedCurrency,
    budgetCategories,
    addBudgetCategory,
    budgetTransactions,
    addBudgetTransaction,
    deleteBudgetTransaction,
    showConfirm,
  } = useAppStore(
    useShallow((state) => ({
      selectedCurrency: state.selectedCurrency,
      setSelectedCurrency: state.setSelectedCurrency,
      budgetCategories: state.budgetCategories,
      addBudgetCategory: state.addBudgetCategory,
      budgetTransactions: state.budgetTransactions,
      addBudgetTransaction: state.addBudgetTransaction,
      deleteBudgetTransaction: state.deleteBudgetTransaction,
      showConfirm: state.showConfirm,
    })),
  );

  const addToast = useToastStore((s) => s.addToast);

  // Initialize a default category if none exist
  useEffect(() => {
    const initDefaultCategory = async () => {
      if (budgetCategories.length === 0) {
        try {
          await addBudgetCategory({
            id: crypto.randomUUID(),
            name: 'General',
            budget: 0,
            color: 'blue',
            icon: '💰',
          });
        } catch (e) {
          console.error('Failed to create default category', e);
        }
      }
    };
    initDefaultCategory();
  }, [budgetCategories.length, addBudgetCategory]);

  // Initial Balance stored locally
  const [initialBalance, setInitialBalance] = useState<number>(() => {
    const saved = localStorage.getItem('expense_tracker_initial_balance');
    return saved ? Number(saved) : 1000;
  });

  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(String(initialBalance));

  // Form State
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Categories list based on transaction type selection
  const categoriesList = useMemo(() => {
    if (txType === 'income') {
      return ['Salary', 'Freelance', 'Business', 'Investments', 'Bonus', 'Gift', 'Rental Income', 'Refunds', 'Grants'];
    } else {
      return [
        'Food & Dining',
        'Rent & Bills',
        'Shopping',
        'Travel',
        'Entertainment',
        'Groceries',
        'Health & Fitness',
        'Education',
        'Gifts & Donations',
        'Insurance',
        'Transport',
        'Subscriptions',
        'Taxes',
        'Miscellaneous',
      ];
    }
  }, [txType]);

  const categoryOptions = useMemo(() => {
    return categoriesList.map((cat) => ({
      value: cat,
      label: `${CATEGORY_EMOJIS[cat] || '🏷️'} ${cat}`,
    }));
  }, [categoriesList]);

  // Sync category input when switching transaction types
  useEffect(() => {
    setTxCategory(categoriesList[0] || '');
  }, [txType, categoriesList]);

  // Parse transaction details (custom logic to store title & category in description text field)
  const parsedTransactions = useMemo(() => {
    return budgetTransactions.map((t) => {
      let title = t.description;
      let category = 'Miscellaneous';
      try {
        const parsed = JSON.parse(t.description);
        if (parsed && typeof parsed === 'object') {
          title = parsed.title || t.description;
          category = parsed.category || 'Miscellaneous';
        }
      } catch (e) {
        // Plain string fallback
      }
      return {
        ...t,
        parsedTitle: title,
        parsedCategory: category,
      };
    });
  }, [budgetTransactions]);

  // Calculations
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    parsedTransactions.forEach((t) => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });
    return {
      totalIncome: income,
      totalExpenses: expense,
      remainingBalance: initialBalance + income - expense,
    };
  }, [parsedTransactions, initialBalance]);

  // Filtered transactions sorted by Date (newest first)
  const filteredTransactions = useMemo(() => {
    let result = parsedTransactions;

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) => t.parsedTitle.toLowerCase().includes(q) || t.parsedCategory.toLowerCase().includes(q),
      );
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter((t) => t.type === filterType);
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter((t) => t.parsedCategory === filterCategory);
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [parsedTransactions, searchQuery, filterType, filterCategory]);

  // Get all unique categories present in the current transactions to populate filter dropdown
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    parsedTransactions.forEach((t) => {
      if (t.parsedCategory) categories.add(t.parsedCategory);
    });
    return Array.from(categories);
  }, [parsedTransactions]);

  const filterCategoryOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Categories' },
      ...uniqueCategories.map((cat) => ({
        value: cat,
        label: `${CATEGORY_EMOJIS[cat] || '🏷️'} ${cat}`,
      })),
    ];
  }, [uniqueCategories]);

  const handleUpdateBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(balanceInput);
    if (isNaN(val) || val < 0) {
      addToast('Invalid Balance', 'Initial balance must be a non-negative number.', 'warning');
      return;
    }
    setInitialBalance(val);
    localStorage.setItem('expense_tracker_initial_balance', String(val));
    setIsEditingBalance(false);
    const sym = getCurrencySymbol(selectedCurrency);
    addToast('Balance Updated', `Initial balance configured to ${sym}${val.toLocaleString()}`, 'success');
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!txTitle.trim()) {
      addToast('Required Field Missing', 'Please enter a title for the transaction.', 'warning');
      return;
    }

    const amountNum = Number(txAmount);
    if (!txAmount || isNaN(amountNum) || amountNum <= 0) {
      addToast('Invalid Amount', 'Please enter a positive numeric amount.', 'warning');
      return;
    }

    if (!txCategory) {
      addToast('Required Field Missing', 'Please select a valid category.', 'warning');
      return;
    }

    if (!txDate) {
      addToast('Required Field Missing', 'Please select a date.', 'warning');
      return;
    }

    // Find database category ID
    const targetCategoryId = budgetCategories[0]?.id;
    if (!targetCategoryId) {
      addToast('Database Error', 'Syncing default category. Please try again in a moment.', 'info');
      return;
    }

    const txId = crypto.randomUUID();
    const serializedDescription = JSON.stringify({
      title: txTitle.trim(),
      category: txCategory,
    });

    try {
      await addBudgetTransaction({
        id: txId,
        categoryId: targetCategoryId,
        amount: amountNum,
        description: serializedDescription,
        date: new Date(txDate).toISOString(),
        type: txType,
        paymentMethod: 'online',
      });

      // Reset transaction form input
      setTxTitle('');
      setTxAmount('');
      addToast('Transaction Saved', 'Financial item logged successfully.', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudgetTransaction(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = () => {
    if (budgetTransactions.length === 0) {
      addToast('History Empty', 'No transactions exist to clear.', 'info');
      return;
    }

    showConfirm(
      'Wipe Transaction History',
      'Are you sure you want to permanently clear all transactions? This action will sync with database and cannot be undone.',
      async () => {
        try {
          for (const tx of budgetTransactions) {
            await deleteBudgetTransaction(tx.id);
          }
          addToast('History Cleared', 'All transaction history wiped successfully.', 'success');
        } catch (e) {
          addToast('Error', 'Failed to clear all transactions.', 'error');
        }
      },
    );
  };

  return (
    <div className="relative min-h-full w-full bg-background text-text-primary overflow-y-auto px-4 py-6 md:p-8">
      {/* Cupertino-style backdrop ambient lights */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full bg-rose-500/10 dark:bg-rose-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Header Container */}
      <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-surface border border-border flex items-center justify-center text-primary shadow-subtle">
              <IconWallet className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Expense & Income</h1>
          </div>
          <p className="text-xs text-text-secondary mt-1 font-medium pl-0.5">
            Clean, minimal asset tracking inspired by Cupertino design principles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency Selector */}
          <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl px-3.5 py-1.5 shadow-subtle text-xs font-semibold text-text-secondary">
            <span>Currency:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer text-text-primary border-none p-0 pr-1"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-surface border border-border hover:bg-surface-hover text-rose-600 dark:text-rose-400 transition-colors shadow-subtle cursor-pointer active:scale-[0.98] border-none"
          >
            <IconTrash className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>
      </div>

      {/* Layout Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start relative">
        {/* Left Column (balances + transaction list) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <BudgetStats
            remainingBalance={totals.remainingBalance}
            initialBalance={initialBalance}
            balanceInput={balanceInput}
            setBalanceInput={setBalanceInput}
            isEditingBalance={isEditingBalance}
            setIsEditingBalance={setIsEditingBalance}
            handleUpdateBalance={handleUpdateBalance}
            totalExpenses={totals.totalExpenses}
            currencyCode={selectedCurrency}
            activeCategoryFilter={filterCategory}
            setActiveCategoryFilter={setFilterCategory}
            onAddTransactionClick={() => setIsAddModalOpen(true)}
          />

          <BudgetTransactionList
            filteredTransactions={filteredTransactions}
            parsedTransactionsLength={parsedTransactions.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterCategoryOptions={filterCategoryOptions}
            handleDelete={handleDelete}
            currencyCode={selectedCurrency}
          />
        </div>

        {/* Right Column (statistics donut + recent activity log) */}
        <div className="lg:col-span-1">
          <BudgetStatsDonut
            transactions={parsedTransactions}
            totalIncome={totals.totalIncome}
            totalExpenses={totals.totalExpenses}
            currencyCode={selectedCurrency}
          />
        </div>
      </div>

      {/* Slide-over Transaction Form Sheet */}
      <BudgetTransactionForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        txType={txType}
        setTxType={setTxType}
        txTitle={txTitle}
        setTxTitle={setTxTitle}
        txAmount={txAmount}
        setTxAmount={setTxAmount}
        txCategory={txCategory}
        setTxCategory={setTxCategory}
        txDate={txDate}
        setTxDate={setTxDate}
        categoryOptions={categoryOptions}
        handleAddTransaction={handleAddTransaction}
        currencyCode={selectedCurrency}
      />
    </div>
  );
}
