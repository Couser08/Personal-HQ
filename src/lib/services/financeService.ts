import { supabase } from '../supabase';
import type {
  StockEntry,
  InterestRecord,
  StandardCalculation,
  BudgetCategory,
  BudgetTransaction,
} from '../../store/types';

export const stockService = {
  async fetchAll(userId: string, limit = 50): Promise<StockEntry[]> {
    const { data, error } = await supabase
      .from('stocks')
      .select('id, ticker, entry_price, quantity, action, notes, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      ticker: r.ticker,
      entryPrice: r.entry_price,
      quantity: r.quantity,
      action: r.action,
      notes: r.notes,
      date: r.date,
    }));
  },

  async create(userId: string, entry: StockEntry) {
    const { error } = await supabase.from('stocks').insert({
      id: entry.id,
      user_id: userId,
      ticker: entry.ticker,
      entry_price: entry.entryPrice,
      quantity: entry.quantity,
      action: entry.action,
      notes: entry.notes,
      date: entry.date,
    });
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('stocks').delete().eq('id', id);
    if (error) throw error;
  },
};

export const interestService = {
  async fetchAll(userId: string, limit = 50): Promise<InterestRecord[]> {
    const { data, error } = await supabase
      .from('interest_records')
      .select('id, type, principal, rate, time, time_unit, interest, total_amount, compound_frequency, label, calculated_at')
      .eq('user_id', userId)
      .order('calculated_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      type: r.type,
      principal: r.principal,
      rate: r.rate,
      time: r.time,
      timeUnit: r.time_unit,
      interest: r.interest,
      totalAmount: r.total_amount,
      compoundFrequency: r.compound_frequency,
      label: r.label,
      calculatedAt: r.calculated_at,
    }));
  },

  async create(userId: string, record: InterestRecord) {
    const { error } = await supabase.from('interest_records').insert({
      id: record.id,
      user_id: userId,
      type: record.type,
      principal: record.principal,
      rate: record.rate,
      time: record.time,
      time_unit: record.timeUnit,
      interest: record.interest,
      total_amount: record.totalAmount,
      compound_frequency: record.compoundFrequency ?? null,
      label: record.label,
      calculated_at: record.calculatedAt,
    });
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('interest_records').delete().eq('id', id);
    if (error) throw error;
  },
};

export const standardCalcService = {
  async fetchAll(userId: string, limit = 50): Promise<StandardCalculation[]> {
    const { data, error } = await supabase
      .from('standard_calculations')
      .select('id, expression, result, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      expression: r.expression,
      result: r.result,
      createdAt: r.created_at,
    }));
  },

  async create(userId: string, record: StandardCalculation) {
    const { error } = await supabase.from('standard_calculations').insert({
      id: record.id,
      user_id: userId,
      expression: record.expression,
      result: record.result,
      created_at: record.createdAt,
    });
    if (error) throw error;
  },

  async clearAll(userId: string) {
    const { error } = await supabase
      .from('standard_calculations')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  }
};

export const budgetCategoryService = {
  async fetchAll(userId: string, limit = 50): Promise<BudgetCategory[]> {
    const { data, error } = await supabase
      .from('budget_categories')
      .select('id, name, budget, color, icon')
      .eq('user_id', userId)
      .limit(limit);
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116' || error.message?.includes('relation') || error.details?.includes('404')) {
        return [];
      }
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      budget: r.budget,
      color: r.color,
      icon: r.icon,
    }));
  },

  async create(userId: string, category: BudgetCategory) {
    const { error } = await supabase.from('budget_categories').insert({
      id: category.id,
      user_id: userId,
      name: category.name,
      budget: category.budget,
      color: category.color,
      icon: category.icon,
    });
    if (error) throw error;
  },

  async update(id: string, data: Partial<BudgetCategory>) {
    const { error } = await supabase.from('budget_categories').update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.budget !== undefined && { budget: data.budget }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.icon !== undefined && { icon: data.icon }),
    }).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error: transactionError } = await supabase
      .from('budget_transactions')
      .delete()
      .eq('category_id', id);
    if (transactionError) throw transactionError;

    const { error } = await supabase.from('budget_categories').delete().eq('id', id);
    if (error) throw error;
  },
};

export const budgetTransactionService = {
  async fetchAll(userId: string, limit = 50): Promise<BudgetTransaction[]> {
    const { data, error } = await supabase
      .from('budget_transactions')
      .select('id, category_id, amount, description, date, type, payment_method')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116' || error.message?.includes('relation') || error.details?.includes('404')) {
        return [];
      }
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      categoryId: r.category_id,
      amount: r.amount,
      description: r.description,
      date: r.date,
      type: r.type,
      paymentMethod: r.payment_method || 'online',
    }));
  },

  async create(userId: string, transaction: BudgetTransaction) {
    const { error } = await supabase.from('budget_transactions').insert({
      id: transaction.id,
      user_id: userId,
      category_id: transaction.categoryId,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      type: transaction.type,
      payment_method: transaction.paymentMethod || 'online',
    });
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('budget_transactions').delete().eq('id', id);
    if (error) throw error;
  },

  async update(id: string, transaction: Partial<BudgetTransaction>) {
    const updateData: any = {};
    if (transaction.categoryId !== undefined) updateData.category_id = transaction.categoryId;
    if (transaction.amount !== undefined) updateData.amount = transaction.amount;
    if (transaction.description !== undefined) updateData.description = transaction.description;
    if (transaction.date !== undefined) updateData.date = transaction.date;
    if (transaction.type !== undefined) updateData.type = transaction.type;
    if (transaction.paymentMethod !== undefined) updateData.payment_method = transaction.paymentMethod;

    const { error } = await supabase.from('budget_transactions').update(updateData).eq('id', id);
    if (error) throw error;
  },
};
