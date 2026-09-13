import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, MapPin, Globe, Clock, Users, Eye, Sparkles } from "lucide-react";
import { CITIES_DB } from "../lib/cities";
import { getSolarTerminatorPath, getTimezoneOffset, getHourCategory } from "../lib/engine";

// Clean vector paths for equirectangular continent outlines (1000x500 viewBox)
const CONTINENT_PATHS = [
  // North America
  "M 150 70 L 220 60 L 280 80 L 310 120 L 260 170 L 240 230 L 200 240 L 170 210 L 140 160 L 110 120 Z",
  // Greenland
  "M 340 40 L 400 35 L 420 60 L 370 90 L 330 70 Z",
  // South America
  "M 260 250 L 330 280 L 360 330 L 320 420 L 270 450 L 250 360 L 240 290 Z",
  // Europe
  "M 470 90 L 530 80 L 570 110 L 530 150 L 460 140 L 460 110 Z",
  // Africa
  "M 460 160 L 560 160 L 580 230 L 550 320 L 490 350 L 440 250 L 440 180 Z",
  // Asia
  "M 560 80 L 750 60 L 850 110 L 820 200 L 710 210 L 660 170 L 580 150 Z",
  // India subcontinent
  "M 670 190 L 720 210 L 700 270 L 670 250 Z",
  // Australia
  "M 780 320 L 860 310 L 890 370 L 820 410 L 760 380 Z",
  // Maritime SE Asia / Japan / UK islands
  "M 440 90 L 455 85 L 450 110 Z M 840 120 L 860 130 L 850 160 Z M 760 250 L 790 260 L 780 280 Z M 800 260 L 840 280 L 820 300 Z"
];

export default function WorldMap({
  members = [],
  currentDate = new Date(),
  activeHour = 14,
  referenceTimezone = "UTC"
}) {
  const [hoveredMember, setHoveredMember] = useState(null);
  const [showTerminator, setShowTerminator] = useState(true);

  // Derive target UTC time from the reference hour
  const targetUTCTime = useMemo(() => {
    const refOffset = getTimezoneOffset(referenceTimezone, currentDate);
    const startOfDayUtc = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0));
    return new Date(startOfDayUtc.getTime() + (activeHour - refOffset) * 3600000);
  }, [currentDate, activeHour, referenceTimezone]);

  const utcHourExact = targetUTCTime.getUTCHours() + targetUTCTime.getUTCMinutes() / 60;

  // Compute the day/night solar terminator curve
  const terminatorPath = useMemo(() => {
    return getSolarTerminatorPath(targetUTCTime, utcHourExact, 1000, 500);
  }, [targetUTCTime, utcHourExact]);

  // Subsolar point (where sun is directly overhead)
  const sunPosition = useMemo(() => {
    const startOfYear = new Date(Date.UTC(targetUTCTime.getUTCFullYear(), 0, 1));
    const dayOfYear = Math.floor((targetUTCTime.getTime() - startOfYear.getTime()) / 86400000) + 1;
    const declinationDeg = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
    const sunLng = (12 - utcHourExact) * 15;
    
    return {
      x: ((sunLng + 180) / 360) * 1000,
      y: ((90 - declinationDeg) / 180) * 500
    };
  }, [targetUTCTime, utcHourExact]);

  // Project teammates to coordinates
  const mappedMembers = useMemo(() => {
    return members.map(m => {
      // Find coordinates from cities DB
      const match = CITIES_DB.find(
        c => c.name.toLowerCase() === (m.city || "").toLowerCase() ||
             c.timezone.toLowerCase() === (m.timezone || "").toLowerCase()
      ) || { lat: 30, lng: 0 };

      const x = ((match.lng + 180) / 360) * 1000;
      const y = ((90 - match.lat) / 180) * 500;

      // Local hour & category
      const offset = getTimezoneOffset(m.timezone, targetUTCTime);
      const localHour = (utcHourExact + offset + 24) % 24;
      const category = getHourCategory(localHour, m.workStart || 9, m.workEnd || 17);

      // Local time string
      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: m.timezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
      const localTimeString = timeFormatter.format(targetUTCTime);

      return {
        ...m,
        lat: match.lat,
        lng: match.lng,
        x,
        y,
        localHour,
        localTimeString,
        category
      };
    });
  }, [members, targetUTCTime, utcHourExact]);

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 overflow-hidden select-none">
      
      {/* MAP CONTROLS HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
            Geographic Daylight Map
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200/50 dark:border-zinc-800">
            {mappedMembers.length} Teammates Mapped
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Day/Night Terminator */}
          <button
            onClick={() => setShowTerminator(!showTerminator)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
              showTerminator
                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800"
            }`}
          >
            {showTerminator ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
            <span>{showTerminator ? "Night Overlay Active" : "Night Overlay Hidden"}</span>
          </button>
        </div>
      </div>

      {/* SVG INTERACTIVE STAGE */}
      <div className="relative w-full aspect-[2/1] bg-slate-950 rounded-xl overflow-hidden border border-zinc-800/80 shadow-2xl">
        
        {/* Equirectangular Grid Lines */}
        <svg viewBox="0 0 1000 500" className="w-full h-full absolute inset-0">
          <defs>
            {/* Dark night mask gradient */}
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            
            <linearGradient id="nightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#020617" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#090d16" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Lat/Long Grid Matrix */}
          <g stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3">
            {/* Equator & Tropics */}
            <line x1="0" y1="250" x2="1000" y2="250" stroke="#64748b" strokeWidth="0.75" strokeDasharray="none" />
            <line x1="0" y1="185" x2="1000" y2="185" />
            <line x1="0" y1="315" x2="1000" y2="315" />
            {/* Meridians */}
            <line x1="500" y1="0" x2="500" y2="500" stroke="#64748b" strokeWidth="0.75" strokeDasharray="none" />
            <line x1="250" y1="0" x2="250" y2="500" />
            <line x1="750" y1="0" x2="750" y2="500" />
          </g>

          {/* Continents Outlines */}
          <g fill="#1e293b" stroke="#334155" strokeWidth="1" opacity="0.7">
            {CONTINENT_PATHS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>

          {/* Real-time Solar Terminator (Night Shading) */}
          {showTerminator && (
            <path
              d={terminatorPath}
              fill="url(#nightGradient)"
              opacity="0.85"
              className="transition-all duration-300 pointer-events-none"
            />
          )}

          {/* Subsolar Sun Marker */}
          <circle
            cx={sunPosition.x}
            cy={sunPosition.y}
            r="24"
            fill="url(#sunGlow)"
            className="pointer-events-none animate-pulse"
          />
          <circle
            cx={sunPosition.x}
            cy={sunPosition.y}
            r="4"
            fill="#fbbf24"
            stroke="#ffffff"
            strokeWidth="1.5"
            className="pointer-events-none shadow"
          />

          {/* Teammate Geographic Pins */}
          {mappedMembers.map((m) => {
            const isHovered = hoveredMember?.id === m.id;
            const isWorking = m.category === "working";
            const isPersonal = m.category === "personal";

            return (
              <g
                key={m.id}
                transform={`translate(${m.x}, ${m.y})`}
                onMouseEnter={() => setHoveredMember(m)}
                onMouseLeave={() => setHoveredMember(null)}
                className="cursor-pointer group"
              >
                {/* Ping ring for working teammates */}
                {isWorking && (
                  <circle
                    r="9"
                    fill="none"
                    stroke={m.color || "#10b981"}
                    strokeWidth="1.5"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}

                {/* Core Teammate Coordinate Marker */}
                <circle
                  r={isHovered ? "7" : "5"}
                  fill={m.color || "#3b82f6"}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-150 shadow-md"
                />

                {/* Teammate Label */}
                <text
                  y={isHovered ? "-12" : "-9"}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={isHovered ? "11" : "9"}
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  className="pointer-events-none drop-shadow-md select-none transition-all"
                >
                  {m.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Teammate Tooltip Card */}
        <AnimatePresence>
          {hoveredMember && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute bottom-4 left-4 p-3 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl shadow-2xl text-white z-30 max-w-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: hoveredMember.color || "#3b82f6" }}
                />
                <span className="text-xs font-bold text-zinc-100">{hoveredMember.name}</span>
                <span className="text-[10px] text-zinc-400 font-mono">({hoveredMember.city})</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800 text-[11px] font-mono">
                <span className="text-amber-400 font-bold">{hoveredMember.localTimeString}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    hoveredMember.category === "working"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : hoveredMember.category === "personal"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-indigo-500/20 text-indigo-300"
                  }`}
                >
                  {hoveredMember.category}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER LEGEND */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Direct Sun Position</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-zinc-600" />
            <span>Night / Eclipse Zone</span>
          </div>
        </div>
        <div>
          <span>Equirectangular World Projection • Real-time Solar Terminator Math</span>
        </div>
      </div>

    </div>
  );
}
