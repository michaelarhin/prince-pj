import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import type { ExpenseInsert } from '../lib/supabase';

const CATEGORIES = [
  { value: 'Food', emoji: '🍔' },
  { value: 'Transport', emoji: '🚗' },
  { value: 'Housing', emoji: '🏠' },
  { value: 'Utilities', emoji: '💡' },
  { value: 'Entertainment', emoji: '🎬' },
  { value: 'Health', emoji: '💊' },
  { value: 'Shopping', emoji: '🛍️' },
  { value: 'Education', emoji: '📚' },
  { value: 'Other', emoji: '📌' },
];

interface ExpenseFormProps {
  onSubmit: (expense: ExpenseInsert) => Promise<unknown>;
  initialData?: ExpenseInsert;
  onCancel?: () => void;
  isEditing?: boolean;
}

export default function ExpenseForm({ onSubmit, initialData, onCancel, isEditing }: ExpenseFormProps) {
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? '');
  const [category, setCategory] = useState(initialData?.category ?? 'Other');
  const [date, setDate] = useState(initialData?.date ?? new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || Number(amount) <= 0) return;

    setSubmitting(true);
    await onSubmit({
      description: description.trim(),
      amount: Number(amount),
      category,
      date,
    });

    if (!isEditing) {
      setDescription('');
      setAmount('');
      setCategory('Other');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onFocus={() => setFocused('desc')}
            onBlur={() => setFocused(null)}
            placeholder="What did you spend on?"
            required
            className={`input-premium ${focused === 'desc' ? 'ring-2 ring-brand-500/30 border-brand-500' : ''}`}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
            Amount (GH₵)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 dark:text-gray-500">GH₵</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onFocus={() => setFocused('amount')}
              onBlur={() => setFocused(null)}
              placeholder="0.00"
              required
              className={`input-premium pl-14 tabular-nums ${focused === 'amount' ? 'ring-2 ring-brand-500/30 border-brand-500' : ''}`}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  category === cat.value
                    ? 'bg-brand-600 text-white shadow-sm scale-[1.02]'
                    : 'bg-gray-50 dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700'
                }`}
              >
                <span className="text-sm">{cat.emoji}</span>
                <span className="truncate">{cat.value}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            onFocus={() => setFocused('date')}
            onBlur={() => setFocused(null)}
            required
            className={`input-premium ${focused === 'date' ? 'ring-2 ring-brand-500/30 border-brand-500' : ''}`}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting || !description.trim() || !amount}
          className="btn-primary flex-1"
        >
          {submitting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <Plus size={16} strokeWidth={2.5} />
              {isEditing ? 'Update' : 'Add Expense'}
            </>
          )}
        </button>
        {isEditing && onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
