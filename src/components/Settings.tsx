import { Globe, Coins, Wallet, ChevronDown } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { CURRENCIES, LANGUAGES } from '../lib/supabase';

export default function Settings() {
  const { preferences, updatePreferences } = useSettings();

  if (!preferences) return null;

  return (
    <div className="space-y-4 stagger">
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/20"><Coins size={14} className="text-brand-600 dark:text-brand-400" /></div>
          <h3 className="section-header">Currency</h3>
        </div>
        <div className="relative">
          <select value={preferences.currency} onChange={e => updatePreferences({ currency: e.target.value })} className="input-premium appearance-none pr-10">
            {CURRENCIES.map(c => (<option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 font-medium">All amounts will be displayed in this currency</p>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20"><Globe size={14} className="text-blue-600 dark:text-blue-400" /></div>
          <h3 className="section-header">Language</h3>
        </div>
        <div className="relative">
          <select value={preferences.language} onChange={e => updatePreferences({ language: e.target.value })} className="input-premium appearance-none pr-10">
            {LANGUAGES.map(l => (<option key={l.code} value={l.code}>{l.name}</option>))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20"><Wallet size={14} className="text-amber-600 dark:text-amber-400" /></div>
          <h3 className="section-header">Monthly Budget</h3>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 dark:text-gray-500">
            {CURRENCIES.find(c => c.code === preferences.currency)?.symbol ?? 'GH₵'}
          </span>
          <input type="number" step="0.01" min="0" value={preferences.monthly_budget || ''} onChange={e => updatePreferences({ monthly_budget: Number(e.target.value) || 0 })} placeholder="Enter monthly budget" className="input-premium pl-14 tabular-nums" />
        </div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 font-medium">Set your budget to get overspending alerts and spending analysis</p>
      </div>
    </div>
  );
}
