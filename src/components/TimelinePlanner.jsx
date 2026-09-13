import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Download,
  Copy,
  Check,
  Globe,
  Plus,
  Trash2,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Users,
  Sun,
  Moon,
  Coffee,
  Briefcase,
  CalendarDays,
  Sparkles,
  Info
} from "lucide-react";
import toast from "react-hot-toast";
import { calculateTimelineData, getTimezoneOffset } from "../lib/engine";
import { getGoogleCalendarUrl, getOutlookCalendarUrl, downloadIcsFile } from "../lib/calendar";

export default function TimelinePlanner({
  members,
  removeMember,
  updateMemberWorkHours,
  referenceTimezone,
  setReferenceTimezone,
  currentDate,
  setCurrentDate,
  openCommandPalette,
  activeHour,
  setActiveHour,
  onLogMeeting
}) {
  const [duration, setDuration] = useState(60); // Meeting duration: 30, 60, 90, 120 minutes
  const [copied, setCopied] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null); // Row ID of member whose shift we are currently editing inline
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredHour, setHoveredHour] = useState(null);

  const gridContainerRef = useRef(null);

  // Derive master timeline data
  const timelineResult = useMemo(() => {
    return calculateTimelineData(members, currentDate, referenceTimezone);
  }, [members, currentDate, referenceTimezone]);

  const isEmpty = members.length === 0;

  // Selected date + hour formatting for proposed meeting
  const proposedMeetingTimeUTC = useMemo(() => {
    if (!timelineResult) return null;
    const { referenceOffset } = timelineResult;
    const startOfDayUtc = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0));
    return new Date(startOfDayUtc.getTime() + (activeHour - referenceOffset) * 3600000);
  }, [currentDate, activeHour, timelineResult]);

  // Translate hours & categories for all members
  const localizedTimes = useMemo(() => {
    if (isEmpty || !proposedMeetingTimeUTC) return [];
    return members.map(m => {
      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: m.timezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
      const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: m.timezone,
        weekday: "short"
      });
      const localTime = timeFormatter.format(proposedMeetingTimeUTC);
      const localWeekday = weekdayFormatter.format(proposedMeetingTimeUTC);
      const localString = `${localWeekday}, ${localTime}`;

      const offset = getTimezoneOffset(m.timezone, proposedMeetingTimeUTC);
      const diffFromRef = offset - getTimezoneOffset(referenceTimezone, proposedMeetingTimeUTC);
      const localHourInt = (activeHour + diffFromRef + 24) % 24;

      // Classify hour category
      let category = "sleeping";
      if (localHourInt >= (m.workStart || 9) && localHourInt < (m.workEnd || 17)) {
        category = "working";
      } else if (localHourInt >= 6 && localHourInt < 22) {
        category = "personal";
      }

      return {
        id: m.id,
        name: m.name,
        city: m.city,
        localString,
        localTime,
        localWeekday,
        category,
        localHour: localHourInt,
        offsetString: `UTC${offset >= 0 ? "+" : ""}${offset}`,
        diffFromRefString: diffFromRef === 0 ? "Same time" : `${diffFromRef > 0 ? "+" : ""}${diffFromRef}h`
      };
    });
  }, [members, proposedMeetingTimeUTC, referenceTimezone, activeHour, isEmpty]);

  // Active meeting slot details
  const activeSlotData = useMemo(() => {
    if (isEmpty || !timelineResult) return null;
    return timelineResult.hourlyData.find(h => h.hour === activeHour) || null;
  }, [timelineResult, activeHour, isEmpty]);

  // Generate Letter Grade & description based on the active hour match score
  const meetingGrade = useMemo(() => {
    if (!activeSlotData) return { grade: "F", label: "No Team Data", color: "text-zinc-400" };
    const score = activeSlotData.score;
    if (score >= 90) return { grade: "S", label: "Perfect Sync Hour", color: "text-emerald-500 dark:text-emerald-400" };
    if (score >= 70) return { grade: "A", label: "Strong Core Overlap", color: "text-teal-500 dark:text-teal-400" };
    if (score >= 50) return { grade: "B", label: "Flexible Overlap", color: "text-amber-500 dark:text-amber-400" };
    if (score >= 30) return { grade: "C", label: "Awkward Sync Hour", color: "text-orange-500 dark:text-orange-400" };
    return { grade: "F", label: "Major Sleep Conflict", color: "text-rose-500 dark:text-rose-400" };
  }, [activeSlotData]);

  // High performance pointer-based scrubber logic
  const handleScrubberMove = (clientX) => {
    if (!gridContainerRef.current) return;
    const rect = gridContainerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
    // Calculate 0-23 hours
    const calculatedHour = Math.round(percentage * 23);
    setActiveHour(calculatedHour);
  };

  const handlePointerDown = (e) => {
    // Only drag with left click / primary pointer
    if (e.button !== 0) return;
    setIsDragging(true);
    handleScrubberMove(e.clientX);
    gridContainerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    // Track hovered index for guideline
    if (gridContainerRef.current) {
      const rect = gridContainerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
      setHoveredHour(Math.round(percentage * 23));
    }

    if (isDragging) {
      handleScrubberMove(e.clientX);
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    if (gridContainerRef.current) {
      gridContainerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const handleCopySummary = () => {
    if (isEmpty || !proposedMeetingTimeUTC) return;
    
    let text = `📅 **Proposed Sync: ${currentDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}**\n`;
    text += `🕒 Time: ${String(activeHour).padStart(2, "0")}:00 (${referenceTimezone})\n`;
    text += `⏳ Duration: ${duration} minutes\n\n`;
    
    localizedTimes.forEach(t => {
      let icon = "💤";
      if (t.category === "working") icon = "💻";
      else if (t.category === "personal") icon = "☕";
      
      text += `${icon} **${t.name}** (${t.city}): ${t.localString} (${t.offsetString})\n`;
    });

    text += `\nCompiled in ChronoShift Studio`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Sync details copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadIcs = () => {
    if (isEmpty || !proposedMeetingTimeUTC) return;
    downloadIcsFile({
      title: "Team Sync (ChronoShift)",
      description: "Timezone-synchronized team meeting.",
      startDate: proposedMeetingTimeUTC,
      durationMinutes: duration
    });
    toast.success("Calendar file (.ics) downloaded!");
  };

  const googleCalendarUrl = useMemo(() => {
    if (isEmpty || !proposedMeetingTimeUTC) return "";
    return getGoogleCalendarUrl({
      title: "Team Sync (ChronoShift)",
      description: "Proposed timezone-synchronized team sync.",
      startDate: proposedMeetingTimeUTC,
      durationMinutes: duration
    });
  }, [proposedMeetingTimeUTC, duration, isEmpty]);

  const availableTimezones = useMemo(() => {
    const list = ["Europe/London", "America/New_York", "Asia/Tokyo", "Asia/Kolkata", "UTC"];
    members.forEach(m => {
      if (!list.includes(m.timezone)) list.push(m.timezone);
    });
    return list;
  }, [members]);

  const formatHourLabel = (h) => {
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  // Convert local hour to sky coloring gradient (Teammate Row ribbon)
  const getSkyGradient = (localHour, workStart = 9, workEnd = 17) => {
    const hour = (localHour + 24) % 24;

    // Is working?
    if (hour >= workStart && hour < workEnd) {
      // Core working hours (emerald daylight)
      return "bg-gradient-to-r from-emerald-500/90 to-emerald-600/95 text-white shadow-inner";
    }

    // Sky colors based on diurnal cycle
    if (hour >= 22 || hour < 5) {
      // Midnight Space
      return "bg-gradient-to-r from-slate-950 via-[#0C0C1E] to-slate-950 text-slate-400 dark:text-zinc-600 border border-black/10 dark:border-white/[0.02]";
    }
    if (hour >= 5 && hour < 7) {
      // Morning Dawn
      return "bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-950/40 text-amber-500 border border-amber-500/10";
    }
    if (hour >= 7 && hour < 9) {
      // Fresh Morning
      return "bg-gradient-to-r from-amber-200/50 via-sky-100 to-sky-200/30 text-amber-700 dark:from-amber-500/10 dark:to-indigo-500/10 dark:text-amber-400 border border-amber-500/10";
    }
    if (hour >= 17 && hour < 19) {
      // Evening Sunset
      return "bg-gradient-to-r from-orange-400/30 via-rose-400/20 to-indigo-950/40 text-orange-600 dark:text-orange-400 border border-orange-500/10";
    }
    if (hour >= 19 && hour < 22) {
      // Twilight Dusk
      return "bg-gradient-to-r from-indigo-950/50 via-purple-950/30 to-slate-950 text-indigo-300 dark:text-indigo-400 border border-indigo-500/5";
    }

    // Default
    return "bg-zinc-100 dark:bg-zinc-900 text-zinc-400";
  };

  // Icon corresponding to the celestial state of that hour
  const getHourIcon = (localHour, workStart = 9, workEnd = 17) => {
    const hour = (localHour + 24) % 24;
    if (hour >= workStart && hour < workEnd) {
      return <Briefcase className="w-3 h-3 opacity-90" />;
    }
    if (hour >= 22 || hour < 5) {
      return <Moon className="w-3 h-3 opacity-40" />;
    }
    if ((hour >= 5 && hour < 9) || (hour >= 17 && hour < 22)) {
      return <Coffee className="w-3 h-3 opacity-60" />;
    }
    return <Sun className="w-3.5 h-3.5 opacity-80" />;
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 select-none font-sans overflow-hidden">
      
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 flex items-center justify-center text-zinc-400 dark:text-zinc-600 mb-6 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-zinc-900 dark:text-zinc-100">Add teammates</h2>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-sm">
            Add team members to compare working hours and find the best meeting times.
          </p>
          <button
            onClick={openCommandPalette}
            className="mt-6 px-4 py-2 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold rounded-lg shadow hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Teammate</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          {/* TOP CONTROLLERS ROW */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/50 dark:border-zinc-900 shrink-0">
            <div>
              <h1 className="text-base font-bold font-sans tracking-tight text-zinc-950 dark:text-zinc-50">
                Timeline
              </h1>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Drag or click to choose a reference time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Dynamic Reference Timezone Dropdown */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100/50 dark:bg-zinc-900/30 text-[11px] font-mono text-zinc-500 border border-zinc-200/40 dark:border-zinc-800">
                <Globe className="w-3 h-3 text-zinc-400" />
                <span>Reference:</span>
                <select
                  value={referenceTimezone}
                  onChange={(e) => setReferenceTimezone(e.target.value)}
                  className="bg-transparent border-none outline-none font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer text-[11px]"
                >
                  {availableTimezones.map((tz) => (
                    <option key={tz} value={tz} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Align Best Overlap Button */}
              <button
                onClick={() => {
                  if (timelineResult?.bestHour !== undefined) {
                    setActiveHour(timelineResult.bestHour);
                    toast.success(`Aligned reference hour to ${formatHourLabel(timelineResult.bestHour)}`);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 transition-all cursor-pointer bg-white dark:bg-[#121214]"
              >
                <span>Best Overlap ({formatHourLabel(timelineResult?.bestHour || 0)})</span>
              </button>
            </div>
          </div>

          {/* 
            THE MAIN HIGH-FIDELITY INTERACTIVE TIMELINE STAGE 
          */}
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/60 rounded-2xl overflow-hidden relative">
            
            {/* Timeline Header Row: Hour Indicators */}
            <div className="flex items-center border-b border-zinc-100 dark:border-zinc-900 h-10 px-6 bg-zinc-50/50 dark:bg-[#0D0D0E]/50 text-[10px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 select-none shrink-0">
              <div className="w-56 shrink-0 text-left">
                TEAM / LOCAL OFFSET
              </div>
              <div className="flex-1 grid grid-cols-24 gap-0.5 text-center h-full items-center">
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} className="h-full flex items-center justify-center border-l border-zinc-100/30 dark:border-zinc-900/10">
                    {h === 0 || h === 12 ? (
                      <span className="text-zinc-900 dark:text-zinc-300 font-bold">{h === 0 ? "12AM" : "12PM"}</span>
                    ) : h % 4 === 0 ? (
                      <span>{h > 12 ? `${h - 12}P` : `${h}A`}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Teammate Tracks Container */}
            <div 
              ref={gridContainerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 relative select-none cursor-crosshair touch-none"
            >
              
              {/* 
                ACTIVE LENS GLASS OVERLAY (SCRUBBER NEEDLE)
                Calculates boundary and highlights active planning frame across rows 
              */}
              <div
                className="absolute top-0 bottom-0 border-l border-r border-zinc-950/15 dark:border-white/10 bg-zinc-950/[0.015] dark:bg-white/[0.015] pointer-events-none transition-all duration-75 z-10"
                style={{
                  left: `calc(14rem + 1.5rem + ${activeHour * (100 / 24)}%)`,
                  width: `calc(${Math.max(1, duration / 60)} * (100% - 14rem - 3rem) / 24)`
                }}
              >
                {/* Visual Glass Edge accents */}
                <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-zinc-950/30 dark:bg-white/30" />
                <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-zinc-950/30 dark:bg-white/30" />
                <div className="absolute top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 font-mono text-[9px] font-bold rounded shadow-md pointer-events-none uppercase tracking-wider">
                  Sync
                </div>
              </div>

              {/* Hover vertical guideline */}
              {hoveredHour !== null && hoveredHour !== activeHour && (
                <div
                  className="absolute top-0 bottom-0 w-[1px] border-l border-dashed border-zinc-200 dark:border-zinc-800 pointer-events-none z-0"
                  style={{
                    left: `calc(14rem + 1.5rem + ${hoveredHour * (100 / 24)}% + (${100 / 24}% / 2))`
                  }}
                />
              )}

              {/* Render Teammate Rows */}
              {timelineResult?.hourlyData[0]?.statuses.map((status, idx) => {
                const member = members.find(m => m.id === status.id);
                if (!member) return null;

                const isEditing = editingMemberId === member.id;
                const offset = getTimezoneOffset(member.timezone, currentDate);

                // Find the local string matching the selected hour
                const localData = localizedTimes.find(t => t.id === member.id);

                return (
                  <div key={member.id} className="flex flex-col gap-2 relative z-20">
                    <div className="flex items-center group/row">
                      
                      {/* Member profile & dynamic local clock info */}
                      <div className="w-56 shrink-0 pr-4 flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: member.color }} />
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate font-sans">
                            {member.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[110px]">
                            {member.city}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono font-bold">
                            {localData ? localData.localWeekday : ""}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-zinc-100/50 dark:border-zinc-900/50">
                          <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide">
                            {localData ? localData.category : ""}
                          </span>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-all">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingMemberId(isEditing ? null : member.id);
                              }}
                              title="Tweak Work Hours"
                              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                            >
                              <SlidersHorizontal className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMember(member.id);
                                toast.success(`Removed ${member.name}`);
                              }}
                              title="Remove Teammate"
                              className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 text-zinc-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Timeline ribbon track */}
                      <div className="flex-1 grid grid-cols-24 gap-0.5 h-12 bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl p-0.5 border border-zinc-200/30 dark:border-zinc-900">
                        {timelineResult.hourlyData.map((h, hIdx) => {
                          const stateAtHour = h.statuses[idx];
                          const cat = stateAtHour.category;
                          const isHourActive = h.hour === activeHour;

                          return (
                            <div
                              key={h.hour}
                              title={`${member.name}: ${cat.toUpperCase()} at local hour ${stateAtHour.localHour}:00`}
                              className={`h-full rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all duration-150 relative overflow-hidden ${getSkyGradient(stateAtHour.localHour, member.workStart || 9, member.workEnd || 17)}`}
                            >
                              {/* Central astronomical icon */}
                              {getHourIcon(stateAtHour.localHour, member.workStart || 9, member.workEnd || 17)}

                              {/* Hour number indicator */}
                              <span className="text-[7.5px] font-mono opacity-55 font-bold">
                                {stateAtHour.localHour}
                              </span>

                              {/* Highlight dot if currently active lens is overlapping */}
                              {isHourActive && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white dark:bg-white animate-pulse" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {/* Inline configuration drawer for shift hours */}
                    <AnimatePresence>
                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-56 flex flex-wrap items-center gap-6 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 rounded-xl text-[11px] text-zinc-500">
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono text-[10px] uppercase tracking-wider">
                              Configure Work Hours:
                            </span>
                            <div className="flex items-center gap-2">
                              <span>Start:</span>
                              <select
                                value={member.workStart || 9}
                                onChange={(e) => updateMemberWorkHours(member.id, parseInt(e.target.value), member.workEnd || 17)}
                                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded font-mono text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer text-[10px]"
                              >
                                {Array.from({ length: 24 }).map((_, h) => (
                                  <option key={h} value={h}>
                                    {String(h).padStart(2, "0")}:00
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>End:</span>
                              <select
                                value={member.workEnd || 17}
                                onChange={(e) => updateMemberWorkHours(member.id, member.workStart || 9, parseInt(e.target.value))}
                                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded font-mono text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer text-[10px]"
                              >
                                {Array.from({ length: 24 }).map((_, h) => (
                                  <option key={h} value={h}>
                                    {String(h).padStart(2, "0")}:00
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={() => setEditingMemberId(null)}
                              className="ml-auto text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            >
                              Done
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

            </div>

            {/* Timeline Ribbon Footer Rulers */}
            <div className="flex items-center border-t border-zinc-100 dark:border-zinc-900 h-8 px-6 bg-zinc-50/50 dark:bg-[#0D0D0E]/50 text-[9px] font-mono font-bold text-zinc-400/80 dark:text-zinc-600 shrink-0">
              <div className="w-56 shrink-0" />
              <div className="flex-1 grid grid-cols-24 text-center">
                {Array.from({ length: 24 }).map((_, h) => (
                  <span key={h}>{h}h</span>
                ))}
              </div>
            </div>

          </div>

          {/* 
            DYNAMIC BOTTOM MEETING HUD DECK
          */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start shrink-0">
            
            {/* LEFT HUD: Sync Window Details */}
            <div className="md:col-span-4 flex flex-col gap-4 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#121214]">
              <div>
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 block">
                  Reference time
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold font-mono tracking-tight text-zinc-950 dark:text-zinc-50">
                    {String(activeHour).padStart(2, "0")}:00
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 px-1.5 py-0.5 rounded">
                    {referenceTimezone}
                  </span>
                </div>
              </div>

              {/* Dynamic Overlap Rating and tiering badge */}
              <div className="flex items-center justify-between py-2 border-t border-b border-zinc-100 dark:border-zinc-900">
                <div>
                  <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 block">
                    Overlap match
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-sm font-bold font-mono ${meetingGrade.color}`}>
                      {meetingGrade.grade} Tier
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      ({activeSlotData ? activeSlotData.score.toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 block">
                    Availability
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 block mt-0.5">
                    💻 {activeSlotData?.workingCount} Core • ☕ {activeSlotData?.personalCount} Flex
                  </span>
                </div>
              </div>

              {/* Set meeting duration presets */}
              <div>
                <span className="block text-[10px] font-medium text-zinc-400 dark:text-zinc-500 mb-2">
                  Duration
                </span>
                <div className="flex gap-1.5">
                  {[30, 60, 90, 120].map((m) => (
                    <button
                      key={m}
                      onClick={() => setDuration(m)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                        duration === m
                           ? "bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-950 dark:border-zinc-100 shadow-sm"
                           : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT HUD: Local translations & Action links */}
            <div className="md:col-span-8 flex flex-col gap-4 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#121214] h-full justify-between">
              <div>
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 block">
                  Local times
                </span>
                
                {/* Horizontal flow cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2.5 max-h-[140px] overflow-y-auto pr-1">
                  {localizedTimes.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 flex flex-col gap-1 text-left"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {t.name}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400 shrink-0">
                          ({t.diffFromRefString})
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-sm font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                          {t.localTime}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
                          {t.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION EXPORTERS DECK */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                {onLogMeeting && (
                  <button
                    onClick={() => {
                      const title = prompt("Enter meeting name / title:", "Team Sync");
                      if (title === null) return; // cancelled
                      onLogMeeting(title || "Team Sync", duration);
                    }}
                    className="px-4 py-2 bg-emerald-500 text-white hover:opacity-90 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lock & Sync</span>
                  </button>
                )}

                <button
                  onClick={handleCopySummary}
                  className="px-4 py-2 bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-900 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Summary"}</span>
                </button>

                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-zinc-200/40 dark:border-zinc-800"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Google Calendar</span>
                </a>

                <button
                  onClick={handleDownloadIcs}
                  className="px-3.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-zinc-200/40 dark:border-zinc-800 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Download .ics</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
