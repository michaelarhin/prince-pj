import { useState } from 'react';
import { Pencil, Trash2, X, Check, MoreHorizontal } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../lib/supabase';
import type { Expense } from '../lib/supabase';

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Food:          { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  Transport:     { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  Housing:       { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  Utilities:     { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-400', dot: 'bg-cyan-500' },
  Entertainment: { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-400', dot: 'bg-pink-500' },
  Health:        { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  Shopping:      { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-400', dot: 'bg-violet-500' },
  Education:     { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-700 dark:text-teal-400', dot: 'bg-teal-500' },
  Other:         { bg: 'bg-gray-50 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-500' },
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Food: '🍔', Transport: '🚗', Housing: '🏠', Utilities: '💡',
  Entertainment: '🎬', Health: '💊', Shopping: '🛍️', Education: '📚', Other: '📌',
};

const CATEGORIES = Object.keys(CATEGORY_STYLES);

interface ExpenseListProps {
  expenses: Expense[];
  onUpdate: (id: string, updates: Partial<Expense>) => Promise<unknown>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function ExpenseList({ expenses, onUpdate, onDelete }: ExpenseListProps) {
  const { preferences } = useSettings();
  const currency = preferences?.currency ?? 'GHS';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditDescription(expense.description);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditDate(expense.date);
    setMenuOpenId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async () => {
    if (!editingId) return;
    await onUpdate(editingId, {
      description: editDescription.trim(),
      amount: Number(editAmount),
      category: editCategory,
      date: editDate,
    });
    setEditingId(null);
  };

  const confirmDelete = async (id: string) => {
    await onDelete(id);
    setConfirmDeleteId(null);
    setMenuOpenId(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (expenses.length === 0) {
    return (
      <div className="glass-card p-10 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg className="text-gray-300 dark:text-gray-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
            <path d="M8 7h8M8 11h8M8 15h4"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No expenses yet</p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Add your first expense above</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 stagger">
      {expenses.map(expense => {
        const style = CATEGORY_STYLES[expense.category] ?? CATEGORY_STYLES.Other;
        const emoji = CATEGORY_EMOJIS[expense.category] ?? '📌';

        if (editingId === expense.id) {
          return (
            <div key={expense.id} className="glass-card p-5 animate-scale-in">
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    className="input-premium"
                    autoFocus
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    className="input-premium tabular-nums"
                  />
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="input-premium"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{CATEGORY_EMOJIS[cat]} {cat}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="input-premium"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="btn-primary text-xs px-4 py-2">
                    <Check size={14} /> Save
                  </button>
                  <button onClick={cancelEdit} className="btn-secondary text-xs px-4 py-2">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={expense.id} className="glass-card p-4 group hover:scale-[1.01] transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center text-lg shrink-0`}>
                {emoji}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {expense.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`badge ${style.bg} ${style.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mr-1`} />
                    {expense.category}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                    {formatDate(expense.date)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                  {formatCurrency(Number(expense.amount), currency)}
                </p>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === expense.id ? null : expense.id)}
                    className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {menuOpenId === expense.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                      <div className="absolute right-0 top-8 z-20 w-36 py-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg animate-scale-in">
                        <button
                          onClick={() => startEdit(expense)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        {confirmDeleteId === expense.id ? (
                          <button
                            onClick={() => confirmDelete(expense.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          >
                            <Check size={12} /> Confirm Delete
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(expense.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
