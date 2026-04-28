import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Lightbulb, Shield, Zap, Target } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../lib/supabase';
import type { Expense } from '../lib/supabase';

interface ExpenseAnalysisProps {
  expenses: Expense[];
}

export default function ExpenseAnalysis({ expenses }: ExpenseAnalysisProps) {
  const { preferences } = useSettings();

  if (!preferences || preferences.monthly_budget <= 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
          <Target size={24} className="text-amber-500" />
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Set a Monthly Budget</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
          Go to Settings and set your monthly budget to unlock spending analysis and overspending alerts.
        </p>
      </div>
    );
  }

  const now = new Date();
  const thisMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthTotal = thisMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const budget = Number(preferences.monthly_budget);
  const remaining = budget - monthTotal;
  const percentUsed = budget > 0 ? (monthTotal / budget) * 100 : 0;
  const isOverBudget = monthTotal > budget;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate() + 1;
  const daysElapsed = Math.min(now.getDate(), daysInMonth);
  const dailyAverage = thisMonthExpenses.length > 0 ? monthTotal / daysElapsed : 0;
  const projectedTotal = dailyAverage * daysInMonth;
  const isProjectedOver = projectedTotal > budget;
  const dailyBudget = budget / daysInMonth;
  const safeDailySpend = remaining > 0 && daysRemaining > 0 ? remaining / daysRemaining : 0;

  const categoryTotals: Record<string, number> = {};
  thisMonthExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
  });
  const topCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);

  const lastMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return d.getMonth() === lm && d.getFullYear() === ly;
  });
  const lastCategoryTotals: Record<string, number> = {};
  lastMonthExpenses.forEach(e => {
    lastCategoryTotals[e.category] = (lastCategoryTotals[e.category] || 0) + Number(e.amount);
  });

  const currency = preferences.currency;

  const recommendations: { icon: typeof Lightbulb; text: string; type: 'warning' | 'tip' | 'success' }[] = [];

  if (isOverBudget) {
    recommendations.push({ icon: AlertTriangle, text: `You've exceeded your budget by ${formatCurrency(monthTotal - budget, currency)}. Review your spending categories to find areas to cut back.`, type: 'warning' });
  }
  if (topCategories.length > 0 && topCategories[0][1] > budget * 0.4) {
    recommendations.push({ icon: Lightbulb, text: `${topCategories[0][0]} accounts for over 40% of your spending. Consider setting a sub-budget for this category.`, type: 'tip' });
  }
  if (isProjectedOver && !isOverBudget) {
    recommendations.push({ icon: TrendingUp, text: `At your current pace, you'll exceed your budget by ${formatCurrency(projectedTotal - budget, currency)}. Try limiting spending to ${formatCurrency(safeDailySpend, currency)}/day.`, type: 'warning' });
  }
  if (!isOverBudget && !isProjectedOver) {
    recommendations.push({ icon: CheckCircle, text: `Great job! You're on track. You can safely spend ${formatCurrency(safeDailySpend, currency)}/day for the rest of the month.`, type: 'success' });
  }
  if (dailyAverage > dailyBudget * 1.5) {
    recommendations.push({ icon: Zap, text: `Your daily average (${formatCurrency(dailyAverage, currency)}) is significantly above your daily budget (${formatCurrency(dailyBudget, currency)}). Consider a no-spend day.`, type: 'warning' });
  }

  return (
    <div className="space-y-4 stagger">
      <div className={`rounded-2xl border p-5 transition-all duration-300 ${isOverBudget ? 'border-red-200 dark:border-red-900/40 bg-gradient-to-br from-red-50 to-white dark:from-red-900/10 dark:to-white/[0.02]' : 'border-gray-200/50 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl'}`}>
        <div className="flex items-center gap-2 mb-4">
          {isOverBudget ? (
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30"><AlertTriangle size={14} className="text-red-600 dark:text-red-400" /></div>
          ) : (
            <div className="p-1.5 rounded-lg bg-brand-100 dark:bg-brand-900/30"><CheckCircle size={14} className="text-brand-600 dark:text-brand-400" /></div>
          )}
          <h3 className="section-header">{isOverBudget ? 'Over Budget!' : 'Within Budget'}</h3>
        </div>

        <div className="w-full h-4 rounded-full bg-gray-100 dark:bg-gray-800/80 overflow-hidden mb-4">
          <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverBudget ? 'bg-gradient-to-r from-red-500 to-red-400' : percentUsed > 75 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-brand-500 to-emerald-400'}`} style={{ width: `${Math.min(percentUsed, 100)}%` }} />
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">{formatCurrency(monthTotal, currency)}</span>
          <span className="text-sm text-gray-400 dark:text-gray-500 tabular-nums">of {formatCurrency(budget, currency)}</span>
        </div>

        {isOverBudget ? (
          <div className="p-3 rounded-xl bg-red-100/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Exceeded by {formatCurrency(monthTotal - budget, currency)}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20">
              <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Remaining</p>
              <p className="text-lg font-bold text-brand-700 dark:text-brand-300 tabular-nums mt-0.5">{formatCurrency(remaining, currency)}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Days Left</p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300 tabular-nums mt-0.5">{daysRemaining}</p>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-1.5 rounded-lg ${isProjectedOver ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-brand-100 dark:bg-brand-900/30'}`}>
            {isProjectedOver ? <TrendingUp size={14} className="text-amber-600 dark:text-amber-400" /> : <TrendingDown size={14} className="text-brand-600 dark:text-brand-400" />}
          </div>
          <h3 className="section-header">Monthly Projection</h3>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">{formatCurrency(projectedTotal, currency)}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">Based on {formatCurrency(dailyAverage, currency)}/day average</p>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/50 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Daily Budget</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums mt-0.5">{formatCurrency(dailyBudget, currency)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Safe Daily Spend</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums mt-0.5">{formatCurrency(safeDailySpend, currency)}</p>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20"><Lightbulb size={14} className="text-amber-600 dark:text-amber-400" /></div>
            <h3 className="section-header">Smart Insights</h3>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, i) => {
              const Icon = rec.icon;
              const colors = {
                warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/30 text-amber-700 dark:text-amber-400',
                tip: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/30 text-blue-700 dark:text-blue-400',
                success: 'bg-brand-50 dark:bg-brand-900/20 border-brand-200/50 dark:border-brand-800/30 text-brand-700 dark:text-brand-400',
              };
              return (
                <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${colors[rec.type]}`}>
                  <Icon size={14} className="mt-0.5 shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">{rec.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {topCategories.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20"><Shield size={14} className="text-rose-600 dark:text-rose-400" /></div>
            <h3 className="section-header">Category Breakdown</h3>
          </div>
          <div className="space-y-4">
            {topCategories.map(([category, total]) => {
              const pct = budget > 0 ? (total / budget) * 100 : 0;
              const lastMonthTotal = lastCategoryTotals[category] ?? 0;
              const catChange = lastMonthTotal > 0 ? ((total - lastMonthTotal) / lastMonthTotal) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</span>
                    <div className="flex items-center gap-2">
                      {catChange !== 0 && <span className={`text-[10px] font-bold ${catChange > 0 ? 'text-red-500' : 'text-brand-500'}`}>{catChange > 0 ? '+' : ''}{catChange.toFixed(0)}%</span>}
                      <span className="text-xs font-semibold text-gray-900 dark:text-white tabular-nums">{formatCurrency(total, currency)}</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill bg-gradient-to-r from-brand-500 to-emerald-400 dark:from-brand-400 dark:to-emerald-300" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
