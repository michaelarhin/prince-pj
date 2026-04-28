import { useState, useEffect, useCallback } from 'react';
import { supabase, type Expense, type ExpenseInsert } from '../lib/supabase';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
    } else {
      setExpenses(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (expense: ExpenseInsert) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      return null;
    }
    setExpenses(prev => [data, ...prev]);
    return data;
  };

  const updateExpense = async (id: string, updates: Partial<ExpenseInsert>) => {
    const { data, error } = await supabase
      .from('expenses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      return null;
    }
    setExpenses(prev => prev.map(e => (e.id === id ? data : e)));
    return data;
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
    setExpenses(prev => prev.filter(e => e.id !== id));
    return true;
  };

  return { expenses, loading, addExpense, updateExpense, deleteExpense, refetch: fetchExpenses };
}
