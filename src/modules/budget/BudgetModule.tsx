import React, { useState, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconWallet, 
  IconTrendingUp, 
  IconTrendingDown, 
  IconPlus, 
  IconTrash, 
  IconSearch, 
  IconEdit, 
  IconCheck, 
  IconX, 
  IconHistory
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useToastStore } from '../../store/useToastStore';
import { CustomSelect } from '../../components/ui/CustomSelect';

// Emojis for categories to enhance scannability (Apple design style)
const CATEGORY_EMOJIS: Record<string, string> = {
  // Income
  Salary: '💼',
  Freelance: '💻',
  Business: '📈',
  Investments: '📊',
  Bonus: '🎁',
  Gift: '💝',
  'Rental Income': '🏢',
  Refunds: '↩️',
  Grants: '📜',
  // Expense
  'Food & Dining': '🍔',
  'Rent & Bills': '🏠',
  Shopping: '🛍️',
  Travel: '✈️',
  Entertainment: '🎬',
  Groceries: '🛒',
  Miscellaneous: '🏷️',
  'Health & Fitness': '🏋️',
  Education: '🎓',
  'Gifts & Donations': '🎁',
  Insurance: '🛡️',
  Transport: '🚗',
  Subscriptions: '🔄',
  Taxes: '💸',
};

// Subtle colors for category background tags
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // Income
  Salary: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/30' },
  Freelance: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/30' },
  Business: { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-900/30' },
  Investments: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/30' },
  Bonus: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/30' },
  Gift: { bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-900/30' },
  'Rental Income': { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-900/30' },
  Refunds: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/30' },
  Grants: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/30' },
  // Expense
  'Food & Dining': { bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-900/30' },
  'Rent & Bills': { bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-900/30' },
  Shopping: { bg: 'bg-pink-50 dark:bg-pink-950/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-900/30' },
  Travel: { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-900/30' },
  Entertainment: { bg: 'bg-violet-50 dark:bg-violet-950/20', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-900/30' },
  Groceries: { bg: 'bg-teal-50 dark:bg-teal-950/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-900/30' },
  Miscellaneous: { bg: 'bg-slate-50 dark:bg-slate-900/30', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800/40' },
  'Health & Fitness': { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/30' },
  Education: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/30' },
  'Gifts & Donations': { bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-900/30' },
  Insurance: { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-900/30' },
  Transport: { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-900/30' },
  Subscriptions: { bg: 'bg-pink-50 dark:bg-pink-950/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-900/30' },
  Taxes: { bg: 'bg-slate-50 dark:bg-slate-900/30', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800/40' },
};

export default function BudgetModule() {
  const addToast = useToastStore((s) => s.addToast);

  // Bind with AppStore for database sync
  const {
    budgetCategories,
    budgetTransactions,
    addBudgetCategory,
    addBudgetTransaction,
    deleteBudgetTransaction,
    showConfirm
  } = useAppStore(
    useShallow((state) => ({
      budgetCategories: state.budgetCategories,
      budgetTransactions: state.budgetTransactions,
      addBudgetCategory: state.addBudgetCategory,
      addBudgetTransaction: state.addBudgetTransaction,
      deleteBudgetTransaction: state.deleteBudgetTransaction,
      showConfirm: state.showConfirm,
    }))
  );

  // Ensure default category is loaded in database to prevent FK constraint failure
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

  // Initial Balance stored locally (as requested)
  const [initialBalance, setInitialBalance] = useState<number>(() => {
    const saved = localStorage.getItem('expense_tracker_initial_balance');
    return saved ? Number(saved) : 1000; // default to 1000
  });

  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(String(initialBalance));

  // Form State
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);

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
        'Food & Dining', 'Rent & Bills', 'Shopping', 'Travel', 'Entertainment', 
        'Groceries', 'Health & Fitness', 'Education', 'Gifts & Donations', 
        'Insurance', 'Transport', 'Subscriptions', 'Taxes', 'Miscellaneous'
      ];
    }
  }, [txType]);

  const categoryOptions = useMemo(() => {
    return categoriesList.map(cat => ({
      value: cat,
      label: `${CATEGORY_EMOJIS[cat] || '🏷️'} ${cat}`
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
        (t) =>
          t.parsedTitle.toLowerCase().includes(q) ||
          t.parsedCategory.toLowerCase().includes(q)
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
    addToast('Balance Updated', `Initial balance configured to $${val.toLocaleString()}`, 'success');
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

      // Reset transaction form input (keep date and type for convenience)
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
          // Sequentially delete to ensure backend cleans up
          for (const tx of budgetTransactions) {
            await deleteBudgetTransaction(tx.id);
          }
          addToast('History Cleared', 'All transaction history wiped successfully.', 'success');
        } catch (e) {
          addToast('Error', 'Failed to clear all transactions.', 'error');
        }
      }
    );
  };

  // Helper formats
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const getCategoryConfig = (categoryName: string) => {
    return (
      CATEGORY_COLORS[categoryName] || {
        bg: 'bg-slate-50 dark:bg-slate-900/30',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-800/40',
      }
    );
  };

  return (
    <div className="relative min-h-full w-full bg-background text-text-primary overflow-y-auto px-4 py-6 md:p-8">
      {/* Apple-style background blur blobs (purely aesthetic - no glassmorphism on cards) */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full bg-rose-500/10 dark:bg-rose-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Header Container */}
      <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-surface border border-border flex items-center justify-center text-primary shadow-subtle">
              <IconWallet className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Expense & Income
            </h1>
          </div>
          <p className="text-xs text-text-secondary mt-1 font-medium pl-0.5">
            Clean, minimal asset tracking inspired by Cupertino design principles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-surface border border-border hover:bg-surface-hover text-rose-600 dark:text-rose-400 transition-colors shadow-subtle cursor-pointer active:scale-[0.98]"
          >
            <IconTrash className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {/* Core Stats Row - Spans all columns */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
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
                  className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                  title="Configure starting balance"
                >
                  <IconEdit className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleUpdateBalance}
                    className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer"
                    title="Confirm balance"
                  >
                    <IconCheck className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsEditingBalance(false)}
                    className="p-1 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
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
                  {formatCurrency(totals.remainingBalance)}
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
                {formatCurrency(totals.totalIncome)}
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
                {formatCurrency(totals.totalExpenses)}
              </span>
            </div>
            <p className="text-[10px] text-text-muted mt-2 font-medium">
              Sum of negative outflows logged.
            </p>
          </div>
        </div>

        {/* Form Column - Left (1 block wide) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
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
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all relative z-10 cursor-pointer ${
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
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all relative z-10 cursor-pointer ${
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
                className="w-full mt-2 bg-primary hover:bg-primary-muted text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer shadow-subtle flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <IconPlus className="w-4 h-4" />
                Add Transaction
              </button>
            </form>
          </div>
        </div>

        {/* History Column - Right (2 blocks wide) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-subtle flex flex-col gap-4 h-full min-h-[500px]">
            
            {/* List Header controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-text-primary uppercase">
                  Recent Ledger
                </h2>
                <p className="text-[10px] text-text-muted font-medium mt-0.5">
                  Showing {filteredTransactions.length} of {parsedTransactions.length} items
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
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-text-primary text-background'
                    : 'bg-surface-alt text-text-secondary border border-border hover:bg-surface-hover'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  filterType === 'income'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-surface-alt text-text-secondary border border-border hover:bg-surface-hover'
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
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
                              className="p-1 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer duration-150"
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
      </div>
    </div>
  );
}
