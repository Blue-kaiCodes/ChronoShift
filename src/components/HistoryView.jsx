import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileClock,
  Clock,
  Layers,
  Heart,
  Search,
  CheckCircle,
  XCircle,
  BookOpen,
  Eye,
  Trash2,
  Share2
} from "lucide-react";
import toast from "react-hot-toast";

export default function HistoryView({ currentWorkspace, workspaceUsers }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleCopyMeetingDetails = (meeting) => {
    const participantNames = meeting.participants
      .map(pId => {
        const found = workspaceUsers.find(u => u.id === pId || u.uid === pId);
        return found ? (found.displayName || found.fullName || found.email) : null;
      })
      .filter(Boolean)
      .join(", ");

    const text = `Meeting Sync: ${meeting.title}\nDate: ${meeting.date}\nTime: ${String(meeting.hour).padStart(2, "0")}:00 ${meeting.timezone || "Europe/London"}\nParticipants: ${participantNames}`;
    navigator.clipboard.writeText(text);
    toast.success("Meeting coordinate details copied for calendar sharing!");
  };

  const filteredHistory = useMemo(() => {
    const history = currentWorkspace?.meetingHistory || [];
    if (!searchQuery) return history;
    const q = searchQuery.toLowerCase().trim();
    return history.filter(m =>
      m.title.toLowerCase().includes(q) ||
      (m.timezone && m.timezone.toLowerCase().includes(q))
    );
  }, [currentWorkspace, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900/60 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            History
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Past meeting records and workspace analytics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVE FILTER & HISTORIC RECORDS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl">
            
            {/* Search Input */}
            <div className="relative mb-5">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter past meetings by title or timezone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((m) => {
                  const resolvedNames = m.participants
                    .map(pId => {
                      const found = workspaceUsers.find(u => u.id === pId || u.uid === pId);
                      return found ? (found.displayName || found.fullName || found.email) : null;
                    })
                    .filter(Boolean);

                  return (
                    <div
                      key={m.id}
                      className="p-4 bg-zinc-50/20 dark:bg-[#121214]/20 border border-zinc-100 dark:border-zinc-900/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {m.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono block mt-1">
                          {m.date} • {m.duration}m
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-1 mt-2">
                          <span className="text-[10px] text-zinc-400 mr-1">Teammates:</span>
                          {resolvedNames.map((name, idx) => (
                            <span key={idx} className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.2 rounded">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 self-stretch sm:self-auto pt-3 sm:pt-0 border-t sm:border-0 border-zinc-100 dark:border-zinc-900/60">
                        <div className="sm:text-right">
                          <span className="text-xs font-mono font-bold text-zinc-950 dark:text-zinc-50">
                            {String(m.hour).padStart(2, "0")}:00
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400 block uppercase">
                            {m.timezone || "Europe/London"}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyMeetingDetails(m)}
                          className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-500 transition-colors cursor-pointer"
                          title="Copy details"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-zinc-400 text-xs flex flex-col items-center justify-center gap-2">
                  <FileClock className="w-8 h-8 text-zinc-300" />
                  <p>No past meetings found.</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: ANALYTICS & SAVED TIMES */}
        <div className="space-y-6">
          
          {/* FAVORITE WINDOWS */}
          <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl">
            <h3 className="text-xs font-medium text-zinc-500 mb-3 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Saved times</span>
            </h3>

            <div className="space-y-2">
              <div className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Afternoon Bridge</span>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5">14:00 - 16:00 UTC</span>
                </div>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-500 px-1.5 rounded font-bold">94%</span>
              </div>

              <div className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Morning Asia Bridge</span>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5">08:00 - 09:30 UTC</span>
                </div>
                <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 px-1.5 rounded font-bold">81%</span>
              </div>
            </div>
          </div>

          {/* HISTORIC METRICS */}
          <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl">
            <h3 className="text-xs font-medium text-zinc-500 mb-3 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
              <span>Analytics</span>
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Average Sync Score</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">89%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Total Logged Hours</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">6.5 Hours</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Primary Meeting Timezone</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">Europe/London</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
