import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder',
);

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export type ExpenseInsert = Omit<Expense, 'id' | 'created_at' | 'updated_at'>;

export interface UserPreferences {
  id: string;
  currency: string;
  language: string;
  monthly_budget: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentConnection {
  id: string;
  provider_type: 'bank' | 'momo';
  provider_name: string;
  account_number: string;
  is_connected: boolean;
  connected_at: string | null;
  created_at: string;
}

export const CURRENCIES = [
  { code: 'GHS', name: 'Ghana Cedi', symbol: 'GH₵' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
] as const;

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'tw', name: 'Twi' },
  { code: 'ga', name: 'Ga' },
  { code: 'ee', name: 'Ewe' },
  { code: 'dag', name: 'Dagbani' },
] as const;

export const MOMO_PROVIDERS = [
  { id: 'mtn', name: 'MTN MoMo', color: 'bg-yellow-500' },
  { id: 'telecel', name: 'Telecel MoMo', color: 'bg-red-500' },
  { id: 'airteltigo', name: 'AirtelTigo MoMo', color: 'bg-orange-500' },
] as const;

export const BANK_PROVIDERS = [
  { id: 'gcb', name: 'GCB Bank' },
  { id: 'ecobank', name: 'Ecobank Ghana' },
  { id: 'absa', name: 'Absa Bank Ghana' },
  { id: 'stanbic', name: 'Stanbic Bank' },
  { id: 'fidelity', name: 'Fidelity Bank Ghana' },
  { id: 'cal', name: 'CAL Bank' },
  { id: 'adb', name: 'Agricultural Development Bank' },
  { id: 'sg', name: 'Societe Generale Ghana' },
] as const;

export function formatCurrency(amount: number, currencyCode: string = 'GHS'): string {
  if (currencyCode === 'GHS') {
    return `GH₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
