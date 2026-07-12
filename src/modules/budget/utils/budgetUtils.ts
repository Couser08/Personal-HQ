export const CATEGORY_EMOJIS: Record<string, string> = {
  // Expense
  'Food & Dining': '🍔',
  'Rent & Bills': '🏠',
  'Shopping': '🛍️',
  'Travel': '✈️',
  'Entertainment': '🎬',
  'Groceries': '🛒',
  'Health & Fitness': '💪',
  'Education': '📚',
  'Gifts & Donations': '🎁',
  'Insurance': '🛡️',
  'Transport': '🚗',
  'Subscriptions': '🔄',
  'Taxes': '📝',
  'Miscellaneous': '🏷️',
  // Income
  'Salary': '💼',
  'Freelance': '💻',
  'Business': '📈',
  'Investments': '📊',
  'Bonus': '✨',
  'Gift': '🎁',
  'Rental Income': '🔑',
  'Refunds': '🔄',
  'Grants': '🎓'
};

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Food & Dining': { bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-900/30' },
  'Rent & Bills': { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/30' },
  'Shopping': { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/30' },
  'Travel': { bg: 'bg-cyan-50 dark:bg-cyan-950/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-100 dark:border-cyan-900/30' },
  'Entertainment': { bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/30' },
  'Groceries': { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/30' },
  'Health & Fitness': { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/30' },
  'Education': { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-900/30' },
  'Gifts & Donations': { bg: 'bg-teal-50 dark:bg-teal-950/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-100 dark:border-teal-900/30' },
  'Insurance': { bg: 'bg-gray-50 dark:bg-gray-950/20', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-100 dark:border-gray-900/30' },
  'Transport': { bg: 'bg-sky-50 dark:bg-sky-950/20', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-100 dark:border-sky-900/30' },
  'Subscriptions': { bg: 'bg-violet-50 dark:bg-violet-950/20', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-900/30' },
  'Taxes': { bg: 'bg-stone-50 dark:bg-stone-950/20', text: 'text-stone-600 dark:text-stone-400', border: 'border-stone-100 dark:border-stone-900/30' },
  
  // Income specific colors
  'Salary': { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/30' },
  'Freelance': { bg: 'bg-teal-50 dark:bg-teal-950/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-100 dark:border-teal-900/30' },
  'Business': { bg: 'bg-cyan-50 dark:bg-cyan-950/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-100 dark:border-cyan-900/30' },
  'Investments': { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-900/30' },
  'Bonus': { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/30' },
  'Gift': { bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/30' },
  'Rental Income': { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/30' },
  'Refunds': { bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-900/30' },
  'Grants': { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/30' },
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
};

export const getCategoryConfig = (categoryName: string) => {
  return (
    CATEGORY_COLORS[categoryName] || {
      bg: 'bg-slate-50 dark:bg-slate-900/30',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-800/40',
    }
  );
};
