import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type UserPreferences } from '../lib/supabase';

interface SettingsContextType {
  preferences: UserPreferences | null;
  loading: boolean;
  updatePreferences: (updates: Partial<Pick<UserPreferences, 'currency' | 'language' | 'monthly_budget'>>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching preferences:', error);
      } else if (data) {
        setPreferences(data);
      }
      setLoading(false);
    };
    fetchPreferences();
  }, []);

  const updatePreferences = async (updates: Partial<Pick<UserPreferences, 'currency' | 'language' | 'monthly_budget'>>) => {
    if (!preferences) return;

    const { data, error } = await supabase
      .from('user_preferences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', preferences.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating preferences:', error);
      return;
    }
    if (data) setPreferences(data);
  };

  return (
    <SettingsContext.Provider value={{ preferences, loading, updatePreferences }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
