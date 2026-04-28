import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <Sun
          size={18}
          className={`absolute inset-0 transition-all duration-300 ${
            theme === 'light' ? 'rotate-0 scale-100 opacity-100 text-amber-500' : 'rotate-90 scale-0 opacity-0'
          }`}
        />
        <Moon
          size={18}
          className={`absolute inset-0 transition-all duration-300 ${
            theme === 'dark' ? 'rotate-0 scale-100 opacity-100 text-blue-400' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
    </button>
  );
}
