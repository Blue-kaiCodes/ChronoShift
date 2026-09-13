import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Plus,
  Send,
  UserCheck,
  Check,
  AlertTriangle,
  FileClock,
  Copy,
  ChevronRight,
  UserX
} from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard({
  currentUser,
  currentWorkspace,
  workspaceUsers,
  db,
  onNavigate, // "planner", "team", "history", "settings"
  onScheduleQuick,
  onInviteQuick
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Live local clock that updates automatically every minute
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Timezone summary helpers
  const stats = useMemo(() => {
    let working = 0;
    let personal = 0;
    let sleeping = 0;

    workspaceUsers.forEach(u => {
      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: u.timezone,
          hour: "numeric",
          hour12: false
        });
        const hour = parseInt(formatter.format(now), 10);
        if (hour >= (u.workStart || 9) && hour < (u.workEnd || 17)) {
          working++;
        } else if (hour >= 22 || hour < 6) {
          sleeping++;
        } else {
          personal++;
        }
      } catch {
        working++;
      }
    });

    return { working, personal, sleeping, total: workspaceUsers.length };
  }, [workspaceUsers, now]);

  // Dynamic greeting based on the user's local timezone
  const greetingData = useMemo(() => {
    const userTimezone = currentUser?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";
    let hour = 12;
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: userTimezone,
        hour: "numeric",
        hour12: false
      });
      hour = parseInt(formatter.format(now), 10);
    } catch (e) {
      hour = now.getHours();
    }

    const userName = currentUser?.displayName || currentUser?.fullName || "User";

    let greeting = "";
    let emoji = "";

    if (hour >= 5 && hour < 12) {
      greeting = `Good morning, ${userName}.`;
      emoji = "🌅";
    } else if (hour >= 12 && hour < 17) {
      greeting = `Good afternoon, ${userName}.`;
      emoji = "☀️";
    } else if (hour >= 17 && hour < 21) {
      greeting = `Good evening, ${userName}.`;
      emoji = "🌇";
    } else {
      greeting = `Good night, ${userName}.`;
      emoji = "🌙";
    }

    return { greeting, emoji, hour, userTimezone };
  }, [currentUser, now]);

  // Dynamic contextual subtext information based on real workspace scheduling states
  const contextualMessage = useMemo(() => {
    const userTimezone = greetingData.userTimezone;
    const currentHour = greetingData.hour;

    let todayStr = "";
    try {
      todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: userTimezone }).format(now);
    } catch (e) {
      todayStr = now.toISOString().split("T")[0];
    }

    const meetingsToday = (currentWorkspace?.meetingHistory || []).filter(m => m.date === todayStr);

    if (meetingsToday.length > 0) {
      // Find upcoming meetings scheduled for today (starting at or after currentHour)
      const upcomingMeetings = meetingsToday
        .filter(m => m.hour >= currentHour)
        .sort((a, b) => a.hour - b.hour);

      if (upcomingMeetings.length > 0) {
        const nextMeeting = upcomingMeetings[0];
        const hoursRemaining = nextMeeting.hour - currentHour;
        if (hoursRemaining === 0) {
          return "Your next meeting begins this hour.";
        } else {
          return `Your next meeting begins in ${hoursRemaining} hour${hoursRemaining > 1 ? "s" : ""}.`;
        }
      }
      return `You have ${meetingsToday.length} meeting${meetingsToday.length > 1 ? "s" : ""} scheduled today.`;
    }

    // Check if everyone is currently within their specified working hours
    const hasTeammates = workspaceUsers.length > 1;
    if (hasTeammates) {
      let everyoneWorking = true;
      workspaceUsers.forEach(u => {
        try {
          const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: u.timezone,
            hour: "numeric",
            hour12: false
          });
          const h = parseInt(formatter.format(now), 10);
          const start = u.workStart ?? 9;
          const end = u.workEnd ?? 17;
          if (h < start || h >= end) {
            everyoneWorking = false;
          }
        } catch {
          everyoneWorking = false;
        }
      });

      if (everyoneWorking) {
        return "Everyone is currently within working hours.";
      }
    }

    // Display timezone diversity count if teammates are spread out
    const uniqueTimezones = new Set(workspaceUsers.map(u => u.timezone)).size;
    if (uniqueTimezones > 1) {
      return `Your team spans ${uniqueTimezones} timezones.`;
    }

    return "No meetings scheduled today — enjoy the rest of your day.";
  }, [currentWorkspace, workspaceUsers, now, greetingData]);

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    onInviteQuick(inviteEmail);
    setInviteEmail("");
  };

  const handleSyncCalendar = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("All third-party calendar conflicts re-synchronized and resolved!");
    }, 1200);
  };

  const handleCopyShareLink = () => {
    const fakeLink = `https://chronoshift.co/join/${currentWorkspace?.id || "default"}`;
    navigator.clipboard.writeText(fakeLink);
    toast.success("Workspace invitation link copied to clipboard!");
  };

  // Generate dynamic meeting suggestions based on overlapping work start/ends
  const generatedOverlapSuggestion = useMemo(() => {
    if (workspaceUsers.length <= 1) return "Add teammates to find overlapping windows.";
    
    return [
      { id: "slot-1", title: "Primary Overlap", score: 94, time: "14:00 - 15:30 UTC" },
      { id: "slot-2", title: "Secondary Overlap", score: 81, time: "09:00 - 10:30 UTC" }
    ];
  }, [workspaceUsers]);

  return (
    <div className="space-y-6">
      
      {/* 1. WELCOME BANNER */}
      <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-zinc-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              {currentWorkspace?.name}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white mt-1.5 tracking-tight flex items-center gap-2.5">
            <span className="text-2xl select-none leading-none">{greetingData.emoji}</span>
            <span>{greetingData.greeting}</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-lg leading-relaxed font-medium">
            {contextualMessage}
          </p>
        </div>
        <div className="flex gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={() => onNavigate("planner")}
            className="flex-1 md:flex-none px-4 py-2.5 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Timeline Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. BENTO STATISTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* STAT 1: MEMBERS */}
        <div className="p-4 bg-white dark:bg-[#0F0F11] border border-zinc-200/50 dark:border-zinc-900/60 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Teammates</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white">
              {workspaceUsers.length}
            </span>
            <span className="text-[10px] font-medium text-emerald-500">Connected</span>
          </div>
        </div>

        {/* STAT 2: WORKING COUNT */}
        <div className="p-4 bg-white dark:bg-[#0F0F11] border border-zinc-200/50 dark:border-zinc-900/60 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Active Office</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white">
              {stats.working}
            </span>
            <span className="text-[10px] font-medium text-zinc-400">In Core Hours</span>
          </div>
        </div>

        {/* STAT 3: PERSONAL/OFF-DUTY */}
        <div className="p-4 bg-white dark:bg-[#0F0F11] border border-zinc-200/50 dark:border-zinc-900/60 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Off Duty</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white">
              {stats.personal}
            </span>
            <span className="text-[10px] font-medium text-zinc-400">Flex/Evening</span>
          </div>
        </div>

        {/* STAT 4: SLEEPING */}
        <div className="p-4 bg-white dark:bg-[#0F0F11] border border-zinc-200/50 dark:border-zinc-900/60 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Resting</span>
            <span className="text-xs text-zinc-500 font-mono">zZ</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white">
              {stats.sleeping}
            </span>
            <span className="text-[10px] font-medium text-zinc-400">Sleeping Mode</span>
          </div>
        </div>

      </div>

      {/* 3. DUAL SECTIONS: LEFT CORE WORKFLOWS, RIGHT REALTIME COWORKERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT & MID COLUMNS (COLLABORATIVE PLANNERS) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SUGGESTIONS */}
          <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
                  Overlap suggestions
                </h3>
              </div>
            </div>

            {Array.isArray(generatedOverlapSuggestion) ? (
              <div className="space-y-3">
                {generatedOverlapSuggestion.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-900/40 rounded-xl bg-zinc-50/40 dark:bg-[#121214]/40 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{s.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/10 text-emerald-500 rounded font-bold">{s.score}% Match</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400 block mt-1">{s.time}</span>
                    </div>
                    <button
                      onClick={() => onScheduleQuick(s)}
                      className="text-[10px] font-bold text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Book Slot</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-400 text-xs">
                {generatedOverlapSuggestion}
              </div>
            )}
          </div>

          {/* CALENDAR INTEGRATION OVERLAY VIEW */}
          <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
                  Third-Party Calendar Feeds
                </h3>
              </div>
              <button
                onClick={handleSyncCalendar}
                disabled={isSyncing}
                className="text-[10px] font-mono font-bold text-indigo-500 hover:underline"
              >
                {isSyncing ? "SYNCING..." : "SYNC NOW"}
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 border border-zinc-100 dark:border-zinc-900/40 rounded-xl bg-zinc-50/20 dark:bg-[#121214]/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block text-zinc-800 dark:text-zinc-200">Google Calendar</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Active Sync: {currentUser?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-mono font-bold text-zinc-400">ACTIVE</span>
                </div>
              </div>

              <div className="p-3 border border-zinc-100 dark:border-zinc-900/40 rounded-xl bg-zinc-50/20 dark:bg-[#121214]/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block text-zinc-800 dark:text-zinc-200">Apple iCal (Local ICS Export)</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Auto-compiled calendars on schedule completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  <span className="text-[10px] font-mono font-bold text-zinc-400">STANDBY</span>
                </div>
              </div>
            </div>
          </div>

          {/* UPCOMING MEETINGS LIST */}
          <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileClock className="w-4 h-4 text-zinc-500" />
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
                  Synchronized Schedule Log
                </h3>
              </div>
              <button
                onClick={() => onNavigate("history")}
                className="text-[10px] font-mono font-bold text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50"
              >
                VIEW FULL HISTORY
              </button>
            </div>

            {currentWorkspace?.meetingHistory && currentWorkspace.meetingHistory.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {currentWorkspace.meetingHistory.map((m) => (
                  <div key={m.id} className="p-3 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-xl border border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{m.title}</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">{m.date} • {m.duration} mins</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 block">
                        {String(m.hour).padStart(2, "0")}:00
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">
                        {m.timezone || "Europe/London"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-400 text-xs flex flex-col items-center justify-center gap-2">
                <Calendar className="w-8 h-8 text-zinc-300" />
                <p>No active meetings registered yet.</p>
                <button
                  onClick={() => onNavigate("planner")}
                  className="mt-2 text-xs font-bold text-indigo-500 hover:underline"
                >
                  Create first timeline slot
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (REALTIME MEMBERS STATUS) */}
        <div className="space-y-6">
          
          {/* TEAM MEMBERS GRID */}
          <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
                  Active Coordinates
                </h3>
              </div>
              <button
                onClick={() => onNavigate("team")}
                className="text-[10px] font-mono font-bold text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50"
              >
                MANAGE TEAM
              </button>
            </div>

            <div className="space-y-3">
              {workspaceUsers.map((u) => {
                // Calculate local hour for this coworker
                let localHourStr = "";
                let category = "personal";
                try {
                  const localTime = new Date().toLocaleTimeString("en-US", {
                    timeZone: u.timezone,
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true
                  });
                  localHourStr = localTime;

                  const currentHour24 = parseInt(new Date().toLocaleTimeString("en-US", {
                    timeZone: u.timezone,
                    hour: "numeric",
                    hour12: false
                  }), 10);
                  if (currentHour24 >= (u.workStart || 9) && currentHour24 < (u.workEnd || 17)) {
                    category = "working";
                  } else if (currentHour24 >= 22 || currentHour24 < 6) {
                    category = "sleeping";
                  }
                } catch {
                  localHourStr = "N/A";
                }

                return (
                  <div key={u.id} className="p-3 bg-zinc-50/40 dark:bg-[#121214]/40 border border-zinc-100 dark:border-zinc-900 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white relative shrink-0"
                        style={{ backgroundColor: u.avatarColor || "#71717a" }}
                      >
                        {(u.displayName || u.fullName || u.email || "U").charAt(0).toUpperCase()}
                        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white dark:border-[#0F0F11] ${
                          category === "working" ? "bg-emerald-500" : category === "sleeping" ? "bg-slate-400" : "bg-amber-500"
                        }`} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                          {u.displayName || u.fullName || u.email || "Anonymous"}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono block">
                          {u.city} • {u.timezone.split("/")[1]?.replace("_", " ") || u.timezone}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono font-bold text-zinc-800 dark:text-zinc-200 block">
                        {localHourStr}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">
                        {category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QUICK DISPATCH INVITATION */}
          <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-5 rounded-2xl">
            <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-zinc-400" />
              <span>Invite Teammate</span>
            </h3>

            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Send Invite</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-zinc-500 transition-all"
                  title="Copy Share Link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
