import { useState, useEffect, useCallback } from 'react';
import { Link2, Smartphone, Building2, Plus, X, Shield, Wifi } from 'lucide-react';
import { supabase, MOMO_PROVIDERS, BANK_PROVIDERS, type PaymentConnection } from '../lib/supabase';

export default function PaymentConnections() {
  const [connections, setConnections] = useState<PaymentConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<'momo' | 'bank'>('momo');
  const [addProvider, setAddProvider] = useState('');
  const [addAccount, setAddAccount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('payment_connections').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching connections:', error); } else { setConnections(data ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchConnections(); }, [fetchConnections]);

  const handleConnect = async () => {
    if (!addProvider || !addAccount.trim()) return;
    setSubmitting(true);
    const provider = addType === 'momo' ? MOMO_PROVIDERS.find(p => p.id === addProvider) : BANK_PROVIDERS.find(p => p.id === addProvider);
    if (!provider) { setSubmitting(false); return; }
    const { data, error } = await supabase.from('payment_connections').insert({
      provider_type: addType, provider_name: provider.name, account_number: addAccount.trim(), is_connected: true, connected_at: new Date().toISOString(),
    }).select().single();
    if (error) { console.error('Error adding connection:', error); } else if (data) { setConnections(prev => [data, ...prev]); }
    setShowAdd(false); setAddProvider(''); setAddAccount(''); setSubmitting(false);
  };

  const handleToggle = async (conn: PaymentConnection) => {
    setConnectingId(conn.id);
    const newStatus = !conn.is_connected;
    const { error } = await supabase.from('payment_connections').update({
      is_connected: newStatus, connected_at: newStatus ? new Date().toISOString() : null,
    }).eq('id', conn.id);
    if (error) { console.error('Error toggling connection:', error); } else {
      setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, is_connected: newStatus, connected_at: newStatus ? new Date().toISOString() : null } : c));
    }
    setConnectingId(null);
  };

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from('payment_connections').delete().eq('id', id);
    if (error) { console.error('Error removing connection:', error); } else { setConnections(prev => prev.filter(c => c.id !== id)); }
  };

  const maskAccount = (acc: string) => acc.length <= 4 ? acc : '****' + acc.slice(-4);

  const getProviderStyle = (name: string) => {
    const momo = MOMO_PROVIDERS.find(p => p.name === name);
    if (momo) {
      const colorMap: Record<string, { bg: string }> = {
        'bg-yellow-500': { bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
        'bg-red-500': { bg: 'bg-red-100 dark:bg-red-900/30' },
        'bg-orange-500': { bg: 'bg-orange-100 dark:bg-orange-900/30' },
      };
      return colorMap[momo.color] ?? { bg: 'bg-gray-100 dark:bg-gray-800' };
    }
    return { bg: 'bg-blue-100 dark:bg-blue-900/30' };
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : connections.length > 0 ? (
        <div className="space-y-2 stagger">
          {connections.map(conn => {
            const style = getProviderStyle(conn.provider_name);
            return (
              <div key={conn.id} className="glass-card p-4 group hover:scale-[1.01] transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl ${style.bg} flex items-center justify-center shrink-0`}>
                    {conn.provider_type === 'momo' ? <Smartphone size={18} className="text-gray-700 dark:text-gray-300" /> : <Building2 size={18} className="text-gray-700 dark:text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{conn.provider_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums font-medium">{maskAccount(conn.account_number)}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${conn.is_connected ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${conn.is_connected ? 'bg-brand-500 animate-pulse-soft' : 'bg-gray-400'}`} />
                        {conn.is_connected ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleToggle(conn)} disabled={connectingId === conn.id}
                      className={`p-2 rounded-xl transition-all duration-200 ${conn.is_connected ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30' : 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'} disabled:opacity-50`}
                      aria-label={conn.is_connected ? 'Disconnect' : 'Reconnect'}>
                      {connectingId === conn.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : conn.is_connected ? <Wifi size={14} /> : <Link2 size={14} />}
                    </button>
                    <button onClick={() => handleRemove(conn.id)}
                      className="p-2 rounded-xl text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Remove"><X size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-10 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Link2 size={24} className="text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No accounts connected</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Add a mobile money or bank account to get started</p>
        </div>
      )}

      {showAdd ? (
        <div className="glass-card p-5 animate-scale-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-header">Add Account</h3>
            <button onClick={() => { setShowAdd(false); setAddProvider(''); setAddAccount(''); }} className="btn-ghost p-2"><X size={16} /></button>
          </div>
          <div className="flex gap-2 mb-5">
            <button onClick={() => { setAddType('momo'); setAddProvider(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${addType === 'momo' ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-50 dark:bg-white/[0.03] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800'}`}>
              <Smartphone size={14} /> Mobile Money
            </button>
            <button onClick={() => { setAddType('bank'); setAddProvider(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${addType === 'bank' ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-50 dark:bg-white/[0.03] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800'}`}>
              <Building2 size={14} /> Bank
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {addType === 'momo' ? MOMO_PROVIDERS.map(p => (
                <button key={p.id} onClick={() => setAddProvider(p.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${addProvider === p.id ? 'bg-brand-600 text-white shadow-sm scale-[1.02]' : 'bg-gray-50 dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700'}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${p.color}`} />{p.name}
                </button>
              )) : BANK_PROVIDERS.map(p => (
                <button key={p.id} onClick={() => setAddProvider(p.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${addProvider === p.id ? 'bg-brand-600 text-white shadow-sm scale-[1.02]' : 'bg-gray-50 dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700'}`}>
                  <Building2 size={12} />{p.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">{addType === 'momo' ? 'Phone Number' : 'Account Number'}</label>
            <input type="text" value={addAccount} onChange={e => setAddAccount(e.target.value)} placeholder={addType === 'momo' ? 'e.g. 024 XXX XXXX' : 'e.g. 0012345678'} className="input-premium" />
          </div>
          <button onClick={handleConnect} disabled={!addProvider || !addAccount.trim() || submitting} className="btn-primary w-full">
            {submitting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><Shield size={14} /> Connect Securely</>}
          </button>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-500 px-4 py-4 text-sm font-semibold hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all duration-200 w-full">
          <Plus size={16} /> Add Payment Account
        </button>
      )}
    </div>
  );
}
