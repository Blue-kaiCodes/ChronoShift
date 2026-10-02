import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileClock,
  Clock,
  Layers,
  Heart,
  Search,
  CheckCircle,
  BookOpen,
  Share2,
  Download,
  BarChart3,
  Timer,
  Globe,
  CalendarDays,
  TrendingUp,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";
import { downloadIcsFile } from "../lib/calendar";

export default function HistoryView({ currentWorkspace, workspaceUsers }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleCopyMeetingDetails = (meeting) => {
    const participantNames = (meeting.participants || [])
      .map(pId => {
        const found = workspaceUsers.find(u => u.id === pId || u.uid === pId);
        return found ? (found.displayName || found.fullName || found.email) : null;
      })
      .filter(Boolean)
      .join(", ");

    const text = `Meeting Sync: ${meeting.title}\nDate: ${meeting.date}\nTime: ${String(meeting.hour).padStart(2, "0")}:00 ${meeting.timezone || "UTC"}\nDuration: ${meeting.duration || 60}m\nParticipants: ${participantNames}`;
    navigator.clipboard.writeText(text);
    toast.success("Meeting details copied to clipboard!");
  };

  const handleDownloadMeetingIcs = (meeting) => {
    try {
      // Reconstruct the UTC start Date from meeting.date + meeting.hour + meeting.timezone
      const [year, month, day] = (meeting.date || "").split("-").map(Number);
      if (!year) { toast.error("Cannot export — missing date info."); return; }
      // Build a rough UTC start: hour in reference TZ, approximate without exact offset info
      const startDate = new Date(Date.UTC(year, month - 1, day, meeting.hour ?? 10, 0, 0));
      downloadIcsFile({
        title: meeting.title,
        description: `Logged via ChronoShift · ${meeting.timezone || "UTC"} reference · ${meeting.duration || 60}min`,
        startDate,
        durationMinutes: meeting.duration || 60
      });
      toast.success("ICS file downloaded!");
    } catch (err) {
      toast.error("Could not generate ICS file.");
    }
  };

  const filteredHistory = useMemo(() => {
    const history = currentWorkspace?.meetingHistory || [];
    if (!searchQuery) return [...history].reverse(); // newest first
    const q = searchQuery.toLowerCase().trim();
    return [...history]
      .reverse()
      .filter(m =>
        (m.title || "").toLowerCase().includes(q) ||
        (m.timezone || "").toLowerCase().includes(q) ||
        (m.date || "").includes(q)
      );
  }, [currentWorkspace, searchQuery]);

  // ── Real computed analytics from actual meeting history ──────────────────────
  const analytics = useMemo(() => {
    const history = currentWorkspace?.meetingHistory || [];
    if (!history.length) return null;

    // Average score (if any meetings have score attached)
    const scored = history.filter(m => typeof m.score === "number");
    const avgScore = scored.length
      ? Math.round(scored.reduce((s, m) => s + m.score, 0) / scored.length)
      : null;

    // Total minutes logged → hours
    const totalMinutes = history.reduce((s, m) => s + (m.duration || 60), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Most-used reference timezone
    const tzCount = {};
    history.forEach(m => {
      if (m.timezone) tzCount[m.timezone] = (tzCount[m.timezone] || 0) + 1;
    });
    const primaryTz = Object.entries(tzCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Best recurring hour windows (most-used hours)
    const hourCount = {};
    history.forEach(m => {
      if (typeof m.hour === "number") hourCount[m.hour] = (hourCount[m.hour] || 0) + 1;
    });
    const topHours = Object.entries(hourCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
        label: (() => {
          const h = parseInt(hour);
          return h === 0 ? "12:00 AM" : h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`;
        })()
      }));

    return { avgScore, totalHours, primaryTz, topHours, total: history.length };
  }, [currentWorkspace]);

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
            {analytics && (
              <span className="ml-2 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                {analytics.total} meeting{analytics.total !== 1 ? "s" : ""} logged
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: MEETING LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl">
            
            {/* Search Input */}
            <div className="relative mb-5">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter by title, timezone, or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
              />
            </div>

            <div className="space-y-3">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((m) => {
                  const resolvedNames = (m.participants || [])
                    .map(pId => {
                      const found = workspaceUsers.find(u => u.id === pId || u.uid === pId);
                      return found ? (found.displayName || found.fullName || found.email) : null;
                    })
                    .filter(Boolean);

                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-zinc-50/20 dark:bg-[#121214]/20 border border-zinc-100 dark:border-zinc-900/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {m.title}
                          </span>
                          {typeof m.score === "number" && (
                            <span className={`ml-auto shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              m.score >= 70 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                              m.score >= 40 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                              "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }`}>
                              {m.score.toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {m.date}
                          </span>
                          {m.duration && (
                            <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-0.5">
                              <Timer className="w-2.5 h-2.5 inline" /> {m.duration}m
                            </span>
                          )}
                          {m.timezone && (
                            <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-0.5">
                              <Globe className="w-2.5 h-2.5 inline" /> {m.timezone.split("/").pop()}
                            </span>
                          )}
                        </div>
                        
                        {resolvedNames.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-2">
                            <span className="text-[10px] text-zinc-400 mr-0.5">Participants:</span>
                            {resolvedNames.map((name, idx) => (
                              <span key={idx} className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                                {name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 self-stretch sm:self-auto pt-3 sm:pt-0 border-t sm:border-0 border-zinc-100 dark:border-zinc-900/60 shrink-0">
                        <div className="sm:text-right">
                          <span className="text-xs font-mono font-bold text-zinc-950 dark:text-zinc-50">
                            {String(m.hour ?? "?").padStart(2, "0")}:00
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400 block uppercase">
                            {(m.timezone || "UTC").split("/").pop()}
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleCopyMeetingDetails(m)}
                            className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-500 transition-colors cursor-pointer"
                            title="Copy details"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadMeetingIcs(m)}
                            className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-500 transition-colors cursor-pointer"
                            title="Download .ics"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-zinc-400 text-xs flex flex-col items-center justify-center gap-2">
                  <FileClock className="w-8 h-8 text-zinc-300" />
                  {searchQuery
                    ? <p>No meetings match <span className="font-mono text-zinc-500">"{searchQuery}"</span></p>
                    : <p>No past meetings yet. Log your first meeting from the Timeline Planner.</p>
                  }
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: REAL ANALYTICS */}
        <div className="space-y-6">
          
          {/* BEST RECURRING WINDOWS — computed from history */}
          <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl">
            <h3 className="text-xs font-medium text-zinc-500 mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Best recurring windows</span>
            </h3>

            {analytics?.topHours?.length > 0 ? (
              <div className="space-y-2">
                {analytics.topHours.map(({ hour, count, label }) => (
                  <div
                    key={hour}
                    className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block font-mono">{label}</span>
                      <span className="text-[10px] text-zinc-400 mt-0.5 block">Used {count} time{count !== 1 ? "s" : ""}</span>
                    </div>
                    <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400 text-center py-4">
                Log meetings to see your best windows
              </p>
            )}
          </div>

          {/* COMPUTED METRICS — all live from meetingHistory */}
          <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl">
            <h3 className="text-xs font-medium text-zinc-500 mb-3 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-zinc-500" />
              <span>Analytics</span>
            </h3>

            {analytics ? (
              <div className="space-y-3">
                {analytics.avgScore !== null && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Avg Overlap Score
                    </span>
                    <span className={`font-mono font-bold ${
                      analytics.avgScore >= 70 ? "text-emerald-600 dark:text-emerald-400" :
                      analytics.avgScore >= 40 ? "text-amber-600 dark:text-amber-400" :
                      "text-rose-600 dark:text-rose-400"
                    }`}>{analytics.avgScore}%</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Timer className="w-3 h-3" /> Total Time Logged
                  </span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{analytics.totalHours}h</span>
                </div>
                {analytics.primaryTz && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Primary Timezone
                    </span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 text-[10px]">{analytics.primaryTz}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-100 dark:border-zinc-900/60">
                  <span className="text-zinc-400 text-[10px]">Computed from live data · IANA/Intl</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400 text-center py-4">
                No meetings logged yet
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
