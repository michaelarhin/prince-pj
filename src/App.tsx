import { useState } from 'react';
import { LayoutDashboard, Receipt, BarChart3, Wallet, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import ErrorBoundary from './components/ErrorBoundary';
import ConfigWarning from './components/ConfigWarning';
import ThemeToggle from './components/ThemeToggle';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';
import Dashboard from './components/Dashboard';
import ExpenseAnalysis from './components/ExpenseAnalysis';
import PaymentConnections from './components/PaymentConnections';
import Settings from './components/Settings';
import { useExpenses } from './hooks/useExpenses';
import type { ExpenseInsert } from './lib/supabase';

type Tab = 'dashboard' | 'expenses' | 'analysis' | 'wallets' | 'settings';

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'analysis', label: 'Analysis', icon: BarChart3 },
  { id: 'wallets', label: 'Wallets', icon: Wallet },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { expenses, loading, addExpense, updateExpense, deleteExpense } = useExpenses();

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) return;
    setIsTransitioning(true);
    setTimeout(() => { setActiveTab(tab); setIsTransitioning(false); }, 150);
  };

  const handleAdd = async (expense: ExpenseInsert) => { await addExpense(expense); };
  const handleUpdate = async (id: string, updates: Partial<ExpenseInsert>) => { await updateExpense(id, updates); };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors duration-500">
      <ConfigWarning />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-600 text-white shadow-glow">
                <Receipt size={20} strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-brand-400 rounded-full border-2 border-white dark:border-[#0a0a0f] animate-pulse-soft" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Cedi<span className="text-gradient">Track</span>
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Smart expense tracking</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* Navigation */}
        <nav className="mb-8 animate-fade-up">
          <div className="flex gap-1 p-1.5 rounded-2xl bg-gray-100/80 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200/50 dark:border-white/[0.06] overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${isActive ? 'bg-white dark:bg-white/[0.08] text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                  <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && <ChevronRight size={12} className="hidden sm:block text-brand-400 dark:text-brand-500" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <main className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {!loading && <ExpenseSummary expenses={expenses} />}
              <div>
                <h2 className="section-header mb-4">Overview</h2>
                {loading ? (<div className="space-y-3"><div className="skeleton h-24 w-full" /><div className="skeleton h-24 w-full" /></div>) : (<Dashboard expenses={expenses} />)}
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-6 animate-fade-in">
              {!loading && <ExpenseSummary expenses={expenses} />}
              <div className="glass-card p-5 sm:p-6">
                <h2 className="section-header mb-5">New Expense</h2>
                <ExpenseForm onSubmit={handleAdd} />
              </div>
              <div>
                <h2 className="section-header mb-4">Recent Expenses</h2>
                {loading ? (<div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-20 w-full" />)}</div>) : (<ExpenseList expenses={expenses} onUpdate={handleUpdate} onDelete={deleteExpense} />)}
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="section-header">Spending Analysis</h2>
              {loading ? (<div className="space-y-3"><div className="skeleton h-32 w-full" /><div className="skeleton h-32 w-full" /></div>) : (<ExpenseAnalysis expenses={expenses} />)}
            </div>
          )}

          {activeTab === 'wallets' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="section-header">Payment Accounts</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">Connect your mobile money or bank accounts</p>
              </div>
              <PaymentConnections />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="section-header">Settings</h2>
              <Settings />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 pb-6 text-center">
          <p className="text-xs text-gray-300 dark:text-gray-700 font-medium">CediTrack &middot; Smart expense tracking for Ghana</p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
