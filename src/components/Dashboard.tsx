import { ArrowUpRight, ArrowDownRight, Calendar, TrendingUp, Receipt, PieChart, Target, Zap, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../lib/supabase';
import type { Expense } from '../lib/supabase';

interface DashboardProps {
  expenses: Expense[];
}

export default function Dashboard({ expenses }: DashboardProps) {
  const { preferences } = useSettings();
  const currency = preferences?.currency ?? 'GHS';

  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = expenses.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return d.getMonth() === lm && d.getFullYear() === ly;
  });

  const totalAll = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalThisMonth = thisMonth.reduce((s, e) => s + Number(e.amount), 0);
  const totalLastMonth = lastMonth.reduce((s, e) => s + Number(e.amount), 0);
  const monthChange = totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0;
  const isUp = monthChange > 0;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = Math.min(now.getDate(), daysInMonth);
  const dailyAvg = thisMonth.length > 0 ? totalThisMonth / daysElapsed : 0;
  const projectedTotal = dailyAvg * daysInMonth;

  const categoryMap: Record<string, number> = {};
  thisMonth.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + Number(e.amount);
  });
  const categories = Object.entries(categoryMap).sort(([, a], [, b]) => b - a);
  const topCategory = categories[0];

  const largestExpense = thisMonth.length > 0
    ? thisMonth.reduce((max, e) => Number(e.amount) > Number(max.amount) ? e : max)
    : null;

  const budget = Number(preferences?.monthly_budget ?? 0);
  const budgetPercent = budget > 0 ? (totalThisMonth / budget) * 100 : 0;
  const budgetRemaining = budget > 0 ? budget - totalThisMonth : 0;

  const timeElapsed = daysElapsed / daysInMonth;
  const budgetElapsed = budget > 0 ? totalThisMonth / budget : 0;
  const spendingVelocity = timeElapsed > 0 ? budgetElapsed / timeElapsed : 0;

  const weekLabels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];
  const weeklyTotals = [0, 0, 0, 0];
  thisMonth.forEach(e => {
    const d = new Date(e.date + 'T00:00:00').getDate();
    const weekIndex = Math.min(Math.floor((d - 1) / 7), 3);
    weeklyTotals[weekIndex] += Number(e.amount);
  });
  const maxWeekly = Math.max(...weeklyTotals, 1);

  return (
    <div className="space-y-4 stagger">
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/20">
              <Receipt size={12} className="text-brand-600 dark:text-brand-400" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total Spent</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">{formatCurrency(totalAll, currency)}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 font-medium">{expenses.length} entries all time</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Calendar size={12} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">This Month</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">{formatCurrency(totalThisMonth, currency)}</p>
          <div className="flex items-center gap-1 mt-1">
            {monthChange !== 0 && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${isUp ? 'text-red-500' : 'text-brand-500'}`}>
                {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {Math.abs(monthChange).toFixed(1)}%
              </span>
            )}
            {monthChange === 0 && <span className="text-[11px] text-gray-400 font-medium">--</span>}
            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">vs last</span>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <TrendingUp size={12} className="text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Daily Avg</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">{formatCurrency(dailyAvg, currency)}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 font-medium">{daysElapsed} of {daysInMonth} days</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20">
              <PieChart size={12} className="text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Top Category</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{topCategory ? topCategory[0] : '--'}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 font-medium">{topCategory ? formatCurrency(topCategory[1], currency) : 'No data'}</p>
        </div>
      </div>

      {budget > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/20">
                <Target size={12} className="text-brand-600 dark:text-brand-400" />
              </div>
              <p className="section-header">Budget</p>
            </div>
            <span className={`badge ${budgetPercent > 100 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : budgetPercent > 75 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'}`}>
              {budgetPercent.toFixed(0)}% used
            </span>
          </div>
          <div className="progress-bar mb-3">
            <div
              className={`progress-fill ${budgetPercent > 100 ? 'bg-gradient-to-r from-red-500 to-red-400' : budgetPercent > 75 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-brand-500 to-emerald-400'}`}
              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium tabular-nums">{formatCurrency(totalThisMonth, currency)} spent</span>
            <span className="text-xs font-semibold tabular-nums">
              {budgetRemaining >= 0 ? (
                <span className="text-brand-600 dark:text-brand-400">{formatCurrency(budgetRemaining, currency)} left</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">{formatCurrency(Math.abs(budgetRemaining), currency)} over</span>
              )}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={12} className="text-amber-500" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Spending Velocity</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {spendingVelocity > 1.2 ? 'Spending faster than expected pace. Consider slowing down.' : spendingVelocity > 1 ? 'Slightly above expected pace for this time of month.' : spendingVelocity > 0 ? 'On track with your budget pace. Great discipline!' : 'No spending recorded this month yet.'}
            </p>
          </div>
        </div>
      )}

      {thisMonth.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Clock size={12} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="section-header">Weekly Pattern</p>
          </div>
          <div className="flex items-end gap-2 h-24">
            {weeklyTotals.map((total, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full relative">
                  <div
                    className="w-full rounded-lg bg-gradient-to-t from-brand-500 to-brand-400 dark:from-brand-400 dark:to-brand-300 transition-all duration-700 ease-out"
                    style={{ height: `${Math.max((total / maxWeekly) * 72, 4)}px` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">{weekLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {largestExpense && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20">
              <Zap size={12} className="text-rose-600 dark:text-rose-400" />
            </div>
            <p className="section-header">Biggest Expense</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{largestExpense.description}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">{largestExpense.category}</p>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums ml-4">{formatCurrency(Number(largestExpense.amount), currency)}</p>
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <PieChart size={12} className="text-amber-600 dark:text-amber-400" />
            </div>
            <p className="section-header">Categories</p>
          </div>
          <div className="space-y-3.5">
            {categories.map(([cat, total]) => {
              const pct = totalThisMonth > 0 ? (total / totalThisMonth) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums font-medium">{pct.toFixed(1)}%</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white tabular-nums">{formatCurrency(total, currency)}</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill bg-gradient-to-r from-brand-500 to-emerald-400 dark:from-brand-400 dark:to-emerald-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {thisMonth.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <TrendingUp size={12} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="section-header">Month Projection</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">{formatCurrency(projectedTotal, currency)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">Based on {formatCurrency(dailyAvg, currency)}/day average</p>
        </div>
      )}
    </div>
  );
}
