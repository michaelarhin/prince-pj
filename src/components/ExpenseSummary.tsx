import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../lib/supabase';
import type { Expense } from '../lib/supabase';
import { Wallet, Calendar, Hash } from 'lucide-react';

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export default function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const { preferences } = useSettings();
  const currency = preferences?.currency ?? 'GHS';

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthTotal = thisMonth.reduce((sum, e) => sum + Number(e.amount), 0);

  const cards = [
    {
      label: 'Total Spent',
      value: formatCurrency(total, currency),
      sub: 'All time',
      icon: Wallet,
      bgLight: 'bg-brand-50',
      bgDark: 'dark:bg-brand-900/20',
      iconColor: 'text-brand-600 dark:text-brand-400',
    },
    {
      label: 'This Month',
      value: formatCurrency(monthTotal, currency),
      sub: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      icon: Calendar,
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Entries',
      value: expenses.length.toString(),
      sub: 'Total records',
      icon: Hash,
      bgLight: 'bg-amber-50',
      bgDark: 'dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 stagger">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="glass-card p-4 group hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-lg ${card.bgLight} ${card.bgDark}`}>
                <Icon size={12} className={card.iconColor} />
              </div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{card.label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">{card.value}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 font-medium">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
