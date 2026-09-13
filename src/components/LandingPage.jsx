import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
  Zap,
  Workflow
} from "lucide-react";

export default function LandingPage({ onGetStarted, onSignIn }) {
  const [demoHour, setDemoHour] = useState(14); // interactive preview slider
  const [activeFaq, setActiveFaq] = useState(null);

  const getDemoSkyClass = (localHour) => {
    const h = (localHour + 24) % 24;
    if (h >= 9 && h < 17) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"; // core work
    if (h >= 22 || h < 6) return "bg-slate-900 text-slate-400 dark:bg-black/40 dark:text-zinc-500 border-zinc-800/40"; // midnight
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"; // personal
  };

  const faqs = [
    {
      q: "How does Chronoshift prevent meeting conflicts?",
      a: "Chronoshift displays team timezone rows side by side. It highlights overlapping work hours instantly, making it easy to find slots that work for everyone."
    },
    {
      q: "Is daylight saving time calculated automatically?",
      a: "Yes. Chronoshift calculates accurate time offsets using the specific future date of your meeting, so schedules remain aligned even across transition dates."
    },
    {
      q: "Can we set custom individual working hours?",
      a: "Absolutely. Every team member can customize their own working schedule and work start/end times in their profile settings. Chronoshift adjusts overlap scores accordingly."
    }
  ];

  return (
    <div className="w-full bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-zinc-100 min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-zinc-200 dark:selection:bg-zinc-800">
      
      {/* 1. STICKY NAVIGATION HEADER */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#070708]/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-900/50 h-16 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-zinc-950 dark:bg-white rounded flex items-center justify-center select-none shrink-0 font-mono text-[9px] font-black text-white dark:text-zinc-950">
            //
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-50">
            Chronoshift
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onSignIn}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="px-4 py-2 bg-zinc-950 dark:bg-zinc-100 hover:opacity-90 text-white dark:text-zinc-950 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative px-6 pt-20 md:pt-32 pb-16 text-center max-w-4xl mx-auto flex flex-col items-center">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-zinc-500/5 dark:bg-zinc-500/2 rounded-full blur-[80px] pointer-events-none" />

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.15] max-w-2xl"
        >
          Coordinate global schedules without the friction.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-sm text-zinc-500 dark:text-zinc-400 mt-6 max-w-lg leading-relaxed font-medium"
        >
          Chronoshift helps remote teams find the best times to meet. Visualize working hours, find overlapping slots, and plan meetings without timezone math.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full justify-center"
        >
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-6 py-3 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Create Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* 3. INTERACTIVE PRODUCT PREVIEW */}
      <section className="px-6 max-w-4xl mx-auto w-full mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="bg-white dark:bg-[#0F0F11] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-lg overflow-hidden p-6 md:p-8"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900/60 pb-4 mb-6">
            <span className="text-[11px] font-medium text-zinc-400">Teammate hours</span>
            <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded text-zinc-500 font-bold">
              {String(demoHour).padStart(2, "0")}:00 UTC
            </span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900 mb-6">
            <input
              type="range"
              min="0"
              max="23"
              value={demoHour}
              onChange={(e) => setDemoHour(parseInt(e.target.value))}
              className="w-full accent-zinc-950 dark:accent-zinc-100 bg-zinc-200 dark:bg-zinc-800 rounded-lg h-1 cursor-ew-resize"
            />
          </div>

          <div className="space-y-3">
            {[
              { name: "Sarah (London)", offset: 0, desc: "Product Lead" },
              { name: "Alex (New York)", offset: -5, desc: "UX Designer" },
              { name: "Sora (Tokyo)", offset: 9, desc: "Staff Engineer" }
            ].map((user) => {
              const localH = (demoHour + user.offset + 24) % 24;
              let stateText = "Personal Time";
              if (localH >= 9 && localH < 17) stateText = "Core Work Hour";
              if (localH >= 22 || localH < 6) stateText = "Sleeping";

              return (
                <div key={user.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/20 dark:bg-[#121214]/40 gap-4">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{user.name}</span>
                    <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">{user.desc} • UTC{user.offset >= 0 ? "+" : ""}{user.offset}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      {String(localH).padStart(2, "0")}:00
                    </span>
                    <div className={`px-2.5 py-0.5 rounded border text-[9px] font-bold ${getDemoSkyClass(localH)}`}>
                      {stateText}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* 4. KEY CAPABILITIES */}
      <section className="px-6 py-6 max-w-4xl mx-auto w-full mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-[#0F0F11] border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 mb-4">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Multiple workspaces</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">
              Create separate workspaces for different teams or clients. Manage members and view schedules in one place.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#0F0F11] border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 mb-4">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Overlap visualization</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">
              See work hours, lunch breaks, and personal hours side by side. Instantly view optimal meeting scores based on overlap.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#0F0F11] border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 mb-4">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Built securely</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">
              All workspace and member data is protected by secure access controls, keeping your schedules safe.
            </p>
          </div>
        </div>
      </section>

      {/* 5. INTEGRATIONS SUMMARY */}
      <section className="px-6 py-12 max-w-4xl mx-auto w-full mb-16 bg-zinc-100/30 dark:bg-[#0F0F11]/30 rounded-3xl border border-zinc-200/30 dark:border-zinc-800 p-8 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">Built for modern digital calendars.</h2>
            <p className="text-xs text-zinc-400 mt-3 leading-relaxed font-medium">
              Specify preferred calendar providers such as Google Calendar or Microsoft Outlook, export customized scheduling coordinates, and manage notifications in one interface.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] flex flex-col justify-between h-24">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Google Calendar</span>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] flex flex-col justify-between h-24">
              <Workflow className="w-4 h-4 text-zinc-500" />
              <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Microsoft Outlook</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="px-6 max-w-3xl mx-auto w-full mb-24">
        <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div
                key={i}
                className="border border-zinc-200 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-[#0F0F11] overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-xs text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium border-t border-zinc-100 dark:border-zinc-900/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-900 py-10 px-6 md:px-12 bg-white dark:bg-[#070708] select-none text-[10px] text-zinc-500">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-zinc-900 dark:bg-zinc-200 rounded flex items-center justify-center font-mono text-[8px] font-black text-white dark:text-zinc-900">
              //
            </div>
            <span className="font-bold tracking-tight text-zinc-500">Chronoshift</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-200">Security</a>
            <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-200">Status</a>
            <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-200">Terms</a>
          </div>
          <p>© 2026 Chronoshift.</p>
        </div>
      </footer>

    </div>
  );
}
