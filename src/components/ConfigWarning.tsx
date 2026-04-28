import { AlertTriangle, Settings } from 'lucide-react';
import { isConfigured } from '../lib/supabase';

export default function ConfigWarning() {
  if (isConfigured) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
          <AlertTriangle size={28} className="text-amber-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Configuration Required</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Supabase environment variables are missing. The app needs <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono">VITE_SUPABASE_URL</code> and <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono">VITE_SUPABASE_ANON_KEY</code> to connect to the database.
        </p>
        <div className="text-left p-4 rounded-xl bg-gray-100 dark:bg-gray-800 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Settings size={14} className="text-gray-400" />
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">For Vercel Deployment</p>
          </div>
          <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
            <li>Go to your Vercel project settings</li>
            <li>Navigate to Environment Variables</li>
            <li>Add <code className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">VITE_SUPABASE_URL</code> with your Supabase URL</li>
            <li>Add <code className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> with your anon key</li>
            <li>Redeploy the project</li>
          </ol>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          For local development, add these to your <code className="font-mono">.env</code> file.
        </p>
      </div>
    </div>
  );
}
