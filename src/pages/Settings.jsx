import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';

export default function Settings() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="max-w-3xl">
            <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-white">Settings</h2>

            <div className="space-y-6">
                {/* Appearance Section */}
                <section>
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Appearance</h3>
                    
                    <div className="rounded-2xl bg-white dark:bg-[#0f0920] border border-zinc-200 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-none">
                        <div className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-white/5 transition border-b border-zinc-200 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300">
                                    {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                                </div>
                                <div>
                                    <div className="font-medium text-zinc-900 dark:text-white">Theme Preference</div>
                                    <div className="text-xs text-zinc-500 mt-0.5">Toggle between Light and Dark mode</div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={toggleTheme}
                                className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-200 dark:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-[#0b0616]"
                            >
                                <span 
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-300 transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1 shadow-sm'}`}
                                />
                            </button>
                        </div>
                        
                        <div className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-white/5 transition">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300">
                                    <Monitor className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-zinc-900 dark:text-white">Active App Theme</div>
                                    <div className="text-xs text-zinc-500 mt-0.5">Currently displaying {theme} colored UI</div>
                                </div>
                            </div>
                            <div className="text-sm font-medium text-zinc-500 capitalize">{theme}</div>
                        </div>
                    </div>
                </section>
                
                {/* Account Section (Placeholder for future) */}
                <section>
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Account Settings</h3>
                    <div className="rounded-2xl p-4 bg-white dark:bg-[#0f0920] border border-zinc-200 dark:border-white/5 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        Additional settings can be added here in the future
                    </div>
                </section>
            </div>
        </div>
    );
}
