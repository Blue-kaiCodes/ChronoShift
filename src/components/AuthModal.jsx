import React from "react";
import { motion } from "framer-motion";
import { Globe, ArrowRight, Sparkles, Terminal } from "lucide-react";

export default function AuthModal({ onAuthSuccess, onGuestLogin, onBackToLanding }) {
  const handleGoogleSignIn = () => {
    onAuthSuccess();
  };

  const handleGuestSignIn = () => {
    if (onGuestLogin) {
      onGuestLogin();
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-50 dark:bg-[#070708] flex flex-col justify-center items-center p-4 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      
      {/* BRAND BACK-TO-LANDING LINK */}
      <button 
        onClick={onBackToLanding}
        className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors text-xs font-medium cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>Back to homepage</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white dark:bg-[#0F0F11] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-xl"
      >
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-zinc-950 dark:bg-white rounded-lg flex items-center justify-center mx-auto mb-4 select-none font-mono text-sm font-black text-white dark:text-zinc-950">
            //
          </div>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight">
            Connect your workspace
          </h2>
          <p className="text-[11px] text-zinc-400 mt-1">
            Choose your preferred sign-in method
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* 1. GOOGLE AUTH BUTTON */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer bg-white dark:bg-[#121214] shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-[0.98]"
          >
            {/* Custom vector Google logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="16" height="16">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.58 15.02 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.86 3C6.27 7.74 8.92 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.42 3.57l3.77 2.92c2.2-2.03 3.46-5.01 3.46-8.65z"
              />
              <path
                fill="#FBBC05"
                d="M5.36 14.5c-.25-.74-.39-1.53-.39-2.35s.14-1.61.39-2.35L1.5 6.8c-.85 1.61-1.34 3.44-1.34 5.38s.49 3.77 1.34 5.38l3.86-3.01z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.77-2.92c-1.05.7-2.39 1.11-4.19 1.11-3.08 0-5.73-2.7-6.64-5.46L1.5 15.83C3.39 19.68 7.35 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
            <ArrowRight className="w-3 h-3 text-zinc-400" />
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-1 text-[10px] font-mono uppercase text-zinc-400">
            <div className="flex-1 h-[1px] bg-zinc-200 dark:bg-zinc-800" />
            <span>or</span>
            <div className="flex-1 h-[1px] bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {/* 2. LOCAL DEVELOPER / DEMO BUTTON (INSTANT ACCESS) */}
          <button
            onClick={handleGuestSignIn}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Continue as Local Developer</span>
            <ArrowRight className="w-3 h-3 opacity-70" />
          </button>
        </div>

        {/* LOCALHOST TIP */}
        <div className="mt-6 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <p className="flex items-start gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              <strong>Localhost Notice:</strong> If Google Sign-In gives <code className="text-rose-500 dark:text-rose-400 font-mono text-[10px]">auth/unauthorized-domain</code>, click <strong>Continue as Local Developer</strong> above for instant 100% full-featured offline access.
            </span>
          </p>
        </div>

      </motion.div>
    </div>
  );
}
