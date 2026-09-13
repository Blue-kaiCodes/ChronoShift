import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  User,
  Clock,
  Calendar,
  Check,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Bell,
  MapPin,
  Laptop
} from "lucide-react";
import { CITIES_DB } from "../lib/cities";

export default function Onboarding({ currentUser, onComplete }) {
  const [step, setStep] = useState(1);

  // Profile Details
  const [fullName, setFullName] = useState(currentUser?.fullName || currentUser?.displayName || "");
  const [username, setUsername] = useState(currentUser?.username || "");
  const [avatarColor, setAvatarColor] = useState(currentUser?.avatarColor || "#3b82f6");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [themePreference, setThemePreference] = useState("dark");
  const [clockFormat, setClockFormat] = useState("12h");

  // Location & Timezone
  const [country, setCountry] = useState("United States");
  const [city, setCity] = useState("New York");
  const [timezone, setTimezone] = useState("America/New_York");

  // Working Hours & Schedule
  const [workStart, setWorkStart] = useState(9);
  const [workEnd, setWorkEnd] = useState(17);
  const [lunchStart, setLunchStart] = useState(12);
  const [lunchEnd, setLunchEnd] = useState(13);
  const [weekendDays, setWeekendDays] = useState([6, 0]); // Sat, Sun
  const [preferredMeetingLength, setPreferredMeetingLength] = useState(30);

  // Integrations & Permissions
  const [calendarProvider, setCalendarProvider] = useState("Google Calendar");
  const [allowCalendarSync, setAllowCalendarSync] = useState(true);
  const [allowEmailNotifications, setAllowEmailNotifications] = useState(true);
  const [allowTeamInvites, setAllowTeamInvites] = useState(true);

  // Attempt auto-timezone detection on mount
  useEffect(() => {
    try {
      const detectedZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detectedZone) {
        setTimezone(detectedZone);
        // Find matching city in DB if possible
        const matchingCity = CITIES_DB.find(c => c.timezone === detectedZone);
        if (matchingCity) {
          setCity(matchingCity.name);
          setCountry(matchingCity.country);
        }
      }
    } catch {
      // fallback
    }
  }, []);

  const handleCityChange = (cityName) => {
    const match = CITIES_DB.find(c => c.name === cityName);
    if (match) {
      setCity(match.name);
      setCountry(match.country);
      setTimezone(match.timezone);
    }
  };

  const toggleWeekendDay = (dayIndex) => {
    if (weekendDays.includes(dayIndex)) {
      setWeekendDays(weekendDays.filter(d => d !== dayIndex));
    } else {
      setWeekendDays([...weekendDays, dayIndex]);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete({
        fullName,
        displayName: fullName,
        username,
        avatarColor,
        preferredLanguage,
        themePreference,
        clockFormat,
        country,
        city,
        timezone,
        workStart: parseInt(workStart),
        workEnd: parseInt(workEnd),
        lunchStart: parseInt(lunchStart),
        lunchEnd: parseInt(lunchEnd),
        weekendDays,
        preferredMeetingLength: parseInt(preferredMeetingLength),
        calendarProvider,
        allowCalendarSync,
        allowEmailNotifications,
        allowTeamInvites
      });
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  // Color options for user initial profile avatars
  const COLORS = ["#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ef4444"];

  return (
    <div className="w-full min-h-screen bg-zinc-50 dark:bg-[#070708] flex items-center justify-center p-4 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <div className="w-full max-w-xl bg-white dark:bg-[#0F0F11] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-xl p-6 md:p-8">
        
        {/* STEP PROGRESS INDICATORS */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-900/60">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-zinc-950 dark:text-zinc-50" />
            <span className="font-mono font-bold text-xs tracking-wider uppercase text-zinc-800 dark:text-zinc-200">
              Set Up Profile
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded text-zinc-400">
            STEP {step} OF 4
          </span>
        </div>

        {/* STEPPER HEADING */}
        <div className="mb-6">
          <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white tracking-tight">
            {step === 1 && "Create your profile"}
            {step === 2 && "Choose your location"}
            {step === 3 && "Set your working hours"}
            {step === 4 && "Integrations and permissions"}
          </h2>
          <p className="text-[10px] font-mono text-zinc-400 mt-0.5 uppercase tracking-wide">
            {step === 1 && "Customize your username, language, and display layout"}
            {step === 2 && "Choose your city and timezone reference"}
            {step === 3 && "Specify your standard working hours, lunch times, and weekends"}
            {step === 4 && "Sync with your calendar and communication preferences"}
          </p>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="min-h-[280px]">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="sarah_sync"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                  Avatar color
                </label>
                <div className="flex items-center gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      className="w-8 h-8 rounded-full border-2 transition-transform cursor-pointer relative shrink-0"
                      style={{
                        backgroundColor: c,
                        borderColor: avatarColor === c ? "#ffffff" : "transparent"
                      }}
                    >
                      {avatarColor === c && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Language
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>Japanese</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Theme
                  </label>
                  <select
                    value={themePreference}
                    onChange={(e) => setThemePreference(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                  >
                    <option value="dark">Dark Theme</option>
                    <option value="light">Light Theme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Clock format
                  </label>
                  <select
                    value={clockFormat}
                    onChange={(e) => setClockFormat(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                  >
                    <option value="12h">12-Hour (AM/PM)</option>
                    <option value="24h">24-Hour (Military)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl mb-2">
                <Globe className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="text-[11px] text-zinc-400 font-mono">
                  Suggested timezone: <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{timezone}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                >
                  {CITIES_DB.map(c => (
                    <option key={c.name} value={c.name}>{c.name} ({c.country})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={country}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-500 dark:text-zinc-400 cursor-not-allowed font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Timezone
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={timezone}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-500 dark:text-zinc-400 cursor-not-allowed font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Work start time
                  </label>
                  <select
                    value={workStart}
                    onChange={(e) => setWorkStart(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Work end time
                  </label>
                  <select
                    value={workEnd}
                    onChange={(e) => setWorkEnd(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Lunch start
                  </label>
                  <select
                    value={lunchStart}
                    onChange={(e) => setLunchStart(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Lunch end
                  </label>
                  <select
                    value={lunchEnd}
                    onChange={(e) => setLunchEnd(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                  Weekend days
                </label>
                <div className="flex gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, idx) => {
                    const i = (idx + 1) % 7; // Align with JavaScript getDay format (0 = Sun, 1 = Mon)
                    const isSelected = weekendDays.includes(i);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleWeekendDay(i)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-zinc-950 text-white border-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100"
                            : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 dark:bg-zinc-950 dark:border-zinc-800 text-zinc-500"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Default meeting duration
                </label>
                <select
                  value={preferredMeetingLength}
                  onChange={(e) => setPreferredMeetingLength(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes (1 Hour)</option>
                  <option value={90}>90 Minutes</option>
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Calendar provider
                </label>
                <select
                  value={calendarProvider}
                  onChange={(e) => setCalendarProvider(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                >
                  <option>Google Calendar</option>
                  <option>Microsoft Outlook</option>
                  <option>Apple Calendar</option>
                </select>
              </div>

              {/* TOGGLES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-900 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block text-zinc-900 dark:text-zinc-100">Sync Live Bookings</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Let ChronoShift query active calendars to flag busy slots.</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowCalendarSync}
                    onChange={(e) => setAllowCalendarSync(e.target.checked)}
                    className="accent-zinc-900 dark:accent-zinc-100 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-900 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-zinc-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block text-zinc-900 dark:text-zinc-100">Email Notifications</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Receive digests on teammate offset updates.</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowEmailNotifications}
                    onChange={(e) => setAllowEmailNotifications(e.target.checked)}
                    className="accent-zinc-900 dark:accent-zinc-100 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-900 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-zinc-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block text-zinc-900 dark:text-zinc-100">Team Invitations</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Allow colleagues to request joins via your email address.</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowTeamInvites}
                    onChange={(e) => setAllowTeamInvites(e.target.checked)}
                    className="accent-zinc-900 dark:accent-zinc-100 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEPPER NAV BUTTONS */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-900/60">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={`flex items-center gap-1 text-xs font-bold transition-all ${
              step === 1
                ? "text-zinc-300 dark:text-zinc-800 cursor-not-allowed"
                : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold rounded-xl hover:opacity-90 shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{step === 4 ? "Enter Workspace" : "Continue"}</span>
            {step < 4 ? <ChevronRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
}
