import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "⌘K / Ctrl+K", desc: "Open Command Palette (search cities, commands)" },
    { key: "M", desc: "Toggle between 24h Timeline and World Map view" },
    { key: "G", desc: "Snap to the #1 optimal Golden Hour" },
    { key: "T", desc: "Reset planning date to Today" },
    { key: "← / →", desc: "Step planning calendar 1 day backward or forward" },
    { key: "Alt + 1..5", desc: "Switch views: Dashboard, Planner, Team, Logs, Settings" },
    { key: "?", desc: "Open or close this Keyboard Shortcuts guide" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-1.5 border-b border-zinc-50 dark:border-zinc-900/60 last:border-0">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">{s.desc}</span>
              <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded font-mono text-[10px] font-bold text-zinc-800 dark:text-zinc-200 shadow-sm shrink-0">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end px-6 py-3 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/40">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold transition-all cursor-pointer"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
}
