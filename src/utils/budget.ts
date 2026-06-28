import type { BudgetCategory, BudgetTransaction } from '../store/useAppStore';

export const calculateBudgetStats = (transactions: BudgetTransaction[]) => {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return { income, expenses, balance: income - expenses };
};

export const calculateCategorySpending = (
  categories: BudgetCategory[],
  transactions: BudgetTransaction[],
) => categories.map((category) => {
  const spent = transactions
    .filter((transaction) => transaction.categoryId === category.id && transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const progress = category.budget > 0 ? Math.min((spent / category.budget) * 100, 100) : 0;
  return { ...category, spent, progress };
});
