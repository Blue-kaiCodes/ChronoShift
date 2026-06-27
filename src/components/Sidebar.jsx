import React, { useState } from 'react';
import { LayoutDashboard, Globe, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../App';

export default function Sidebar({ view, setView }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isDark, setIsDark } = React.useContext(ThemeContext);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Globe, label: 'Golden Hour', id: 'golden' },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative h-screen glass border-r border-white/5 flex flex-col justify-between p-4 z-50"
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl pointer-events-none">
        <div className="blob w-32 h-32 bg-primary top-10 -left-10" style={{animationDelay: '0s'}}></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-10">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-xl font-bold text-gradient tracking-tight">
                ChronoShift
              </motion.h1>
            )}
          </AnimatePresence>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-xl hover:bg-white/5 transition-colors text-muted hover:text-white">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${view === item.id ? 'bg-primary/10 text-primary shadow-glow' : 'text-muted hover:bg-white/5 hover:text-white'}`}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
            >
              <item.icon size={20} className="shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/5 pt-4">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted hover:bg-white/5 hover:text-white transition-colors w-full"
            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
