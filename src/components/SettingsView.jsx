import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Sliders,
  Calendar,
  Bell,
  Lock,
  Keyboard,
  Globe,
  Trash2,
  CheckCircle,
  HelpCircle,
  Clock,
  Briefcase,
  Moon,
  Search,
  Check
} from "lucide-react";
import { CITIES_DB, searchCities, findCity } from "../lib/cities";
import toast from "react-hot-toast";

export default function SettingsView({
  currentUser,
  currentWorkspace,
  onUpdateProfile,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile fields
  const [fullName, setFullName] = useState(currentUser?.fullName || currentUser?.displayName || "");
  const [username, setUsername] = useState(currentUser?.username || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [city, setCity] = useState(currentUser?.city || "New York");
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [workStart, setWorkStart] = useState(currentUser?.workStart ?? 9);
  const [workEnd, setWorkEnd] = useState(currentUser?.workEnd ?? 17);
  const [clockFormat, setClockFormat] = useState(currentUser?.clockFormat || "12h");
  
  // Workspace fields
  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || "");
  const [workspaceType, setWorkspaceType] = useState(currentWorkspace?.type || "Startup");

  // Toggles
  const [allowCalendarSync, setAllowCalendarSync] = useState(currentUser?.allowCalendarSync ?? true);
  const [allowEmailNotifications, setAllowEmailNotifications] = useState(currentUser?.allowEmailNotifications ?? true);
  const [allowTeamInvites, setAllowTeamInvites] = useState(currentUser?.allowTeamInvites ?? true);

  const handleCitySearch = (query) => {
    setCitySearchQuery(query);
    if (query.trim().length >= 2) {
      setCitySuggestions(searchCities(query.trim(), 6));
      setIsCityDropdownOpen(true);
    } else {
      setCitySuggestions([]);
      setIsCityDropdownOpen(false);
    }
  };

  const handleSelectCity = (cityObj) => {
    setCity(cityObj.name);
    setCitySearchQuery("");
    setCitySuggestions([]);
    setIsCityDropdownOpen(false);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    const match = findCity(city) || CITIES_DB.find(c => c.name.toLowerCase() === city.toLowerCase()) || CITIES_DB[0];
    onUpdateProfile({
      fullName,
      displayName: fullName,
      username,
      bio,
      city: match ? match.name : city,
      country: match ? match.country : (currentUser?.country || "United States"),
      countryCode: match ? match.countryCode : (currentUser?.countryCode || "US"),
      timezone: match ? match.timezone : (currentUser?.timezone || "America/New_York"),
      lat: match ? match.lat : (currentUser?.lat || 40.7128),
      lng: match ? match.lng : (currentUser?.lng || -74.006),
      workStart: parseInt(workStart),
      workEnd: parseInt(workEnd),
      clockFormat
    });
  };

  const handleWorkspaceSave = (e) => {
    e.preventDefault();
    onUpdateWorkspace({
      name: workspaceName,
      type: workspaceType
    });
  };

  const handleDeleteWS = () => {
    if (window.confirm(`Are you absolutely sure you want to dissolve "${currentWorkspace?.name}"? This action cannot be undone.`)) {
      onDeleteWorkspace(currentWorkspace.id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900/60 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Settings
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage your profile, workspace settings, calendar integrations, and preferences
          </p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl transition-all border border-red-500/10 cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* TAB SWITCHER SIDEBAR */}
        <div className="bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-3 rounded-2xl space-y-1">
          {[
            { id: "profile", label: "My Profile", icon: User },
            { id: "workspace", label: "Workspace Settings", icon: Sliders },
            { id: "notifications", label: "Notification Feed", icon: Bell },
            { id: "calendar", label: "Calendar Sync", icon: Calendar },
            { id: "shortcuts", label: "Keyboard Shortcuts", icon: Keyboard },
            { id: "privacy", label: "Privacy & Security", icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE TAB VIEW PANEL */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0F0F11] border border-zinc-200/60 dark:border-zinc-900/60 p-6 rounded-2xl min-h-[400px]">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-900/60 pb-3 mb-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Profile Details</h3>
                <span className="text-[10px] text-zinc-400 font-medium">Update your display name, username, and bio</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="3"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* City with searchable autocomplete */}
                <div className="relative">
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center justify-between">
                    <span>City</span>
                    {(() => {
                      const match = findCity(city);
                      return match ? (
                        <span className="text-[10px] font-mono text-zinc-400">
                          {match.countryCode} · {match.timezone.split("/").pop()}
                        </span>
                      ) : null;
                    })()}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={isCityDropdownOpen ? citySearchQuery : city}
                      placeholder="Search city or code (e.g. NYC, London, Tokyo)..."
                      onChange={(e) => handleCitySearch(e.target.value)}
                      onFocus={() => {
                        setCitySearchQuery("");
                        setIsCityDropdownOpen(true);
                        setCitySuggestions(searchCities(city, 6));
                      }}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {isCityDropdownOpen && citySuggestions.length > 0 && (
                    <div className="absolute z-30 mt-1 w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                      {citySuggestions.map((c) => (
                        <button
                          key={`${c.name}-${c.country}`}
                          type="button"
                          onClick={() => handleSelectCity(c)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900/60 last:border-b-0 cursor-pointer"
                        >
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</span>
                            <span className="text-[10px] text-zinc-400 ml-1.5">{c.country}</span>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {c.timezone.split("/").pop()}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Work start time
                  </label>
                  <select
                    value={workStart}
                    onChange={(e) => setWorkStart(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 cursor-pointer"
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
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Overnight shift indicator */}
              {parseInt(workStart) > parseInt(workEnd) && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs">
                  <Moon className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Overnight Schedule:</strong> Shift spans midnight ({String(workStart).padStart(2, "0")}:00 – {String(workEnd).padStart(2, "0")}:00 next day). Fully supported by ChronoShift calculation engine.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Clock format
                </label>
                <select
                  value={clockFormat}
                  onChange={(e) => setClockFormat(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <option value="12h">12-Hour display (AM/PM)</option>
                  <option value="24h">24-Hour display (Military)</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold rounded-xl shadow-md hover:opacity-90 transition-all cursor-pointer"
              >
                Save profile
              </button>
            </form>
          )}

          {/* WORKSPACE TAB */}
          {activeTab === "workspace" && (
            <form onSubmit={handleWorkspaceSave} className="space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-900/60 pb-3 mb-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Workspace Settings</h3>
                <span className="text-[10px] text-zinc-400 font-medium">Customize your workspace details</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    required
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Workspace Type
                  </label>
                  <select
                    value={workspaceType}
                    onChange={(e) => setWorkspaceType(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200"
                  >
                    <option>Startup</option>
                    <option>Freelance</option>
                    <option>University</option>
                    <option>Personal</option>
                    <option>Open Source</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold rounded-xl shadow-md hover:opacity-90 transition-all cursor-pointer"
                >
                  Update workspace
                </button>
              </div>

              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900/60 mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-red-500 block">Delete Workspace</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Permanently delete this workspace and remove all members.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteWS}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete workspace</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-900/60 pb-3 mb-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Notifications</h3>
                <span className="text-[10px] text-zinc-400 font-medium">Configure teammate email digests and invite settings</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-zinc-100 dark:border-zinc-900 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20">
                  <div>
                    <span className="text-xs font-bold block text-zinc-900 dark:text-zinc-100">Teammate invites</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Allow teammates to invite you directly by email.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowTeamInvites}
                    onChange={(e) => setAllowTeamInvites(e.target.checked)}
                    className="w-4 h-4 accent-zinc-950 dark:accent-zinc-100 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-zinc-100 dark:border-zinc-900 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20">
                  <div>
                    <span className="text-xs font-bold block text-zinc-900 dark:text-zinc-100">Digest notifications</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Receive email digests of teammate availability changes.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowEmailNotifications}
                    onChange={(e) => setAllowEmailNotifications(e.target.checked)}
                    className="w-4 h-4 accent-zinc-950 dark:accent-zinc-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CALENDAR SYNC */}
          {activeTab === "calendar" && (
            <div className="space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-900/60 pb-3 mb-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Calendar Integrations</h3>
                <span className="text-[10px] text-zinc-400 font-medium">Manage your linked calendar providers</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-zinc-100 dark:border-zinc-900 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20">
                  <div>
                    <span className="text-xs font-bold block text-zinc-900 dark:text-zinc-100">Calendar synchronization</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Automatically check connected calendars for conflicts.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowCalendarSync}
                    onChange={(e) => setAllowCalendarSync(e.target.checked)}
                    className="w-4 h-4 accent-zinc-950 dark:accent-zinc-100 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-zinc-100 dark:border-zinc-900/60 rounded-xl bg-zinc-50/20 dark:bg-zinc-950/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Google Workspace</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Status: Connected ({currentUser?.email})</span>
                    </div>
                  </div>
                  <div className="p-4 border border-zinc-100 dark:border-zinc-900/60 rounded-xl bg-zinc-50/20 dark:bg-zinc-950/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Outlook Exchange</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Status: Ready to link</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KEYBOARD SHORTCUTS */}
          {activeTab === "shortcuts" && (
            <div className="space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-900/60 pb-3 mb-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Shortcuts</h3>
                <span className="text-[10px] text-zinc-400 font-medium">View available keyboard shortcuts</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono font-bold uppercase text-zinc-400">Navigation</h4>
                  {[
                    { keys: "G + D", desc: "Go to Dashboard" },
                    { keys: "G + P", desc: "Open Timeline Planner" },
                    { keys: "G + T", desc: "Manage Teammates" },
                    { keys: "G + H", desc: "View Meeting Logs" }
                  ].map((s, idx) => (
                    <div key={idx} className="flex justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-900/40">
                      <span className="text-zinc-500">{s.desc}</span>
                      <kbd className="font-mono bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800 font-bold text-[10px] uppercase">
                        {s.keys}
                      </kbd>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono font-bold uppercase text-zinc-400">Planner</h4>
                  {[
                    { keys: "⌘ + K", desc: "Open Command Palette" },
                    { keys: "ESC", desc: "Exit Palette / Active Screen" },
                    { keys: "Left / Right", desc: "Shift reference hour" },
                    { keys: "C", desc: "Copy planning details" }
                  ].map((s, idx) => (
                    <div key={idx} className="flex justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-900/40">
                      <span className="text-zinc-500">{s.desc}</span>
                      <kbd className="font-mono bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800 font-bold text-[10px] uppercase">
                        {s.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-900/60 pb-3 mb-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Privacy & Security</h3>
                <span className="text-[10px] text-zinc-400 font-medium">Learn about our security and privacy practices</span>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  Our application is designed with privacy and security in mind:
                </p>
                <ul className="list-disc list-inside text-xs text-zinc-500 dark:text-zinc-400 space-y-2 leading-relaxed pl-2 font-medium">
                  <li>Your calendar events are kept local to your browser session and never stored on our servers.</li>
                  <li>We only analyze busy/free status to calculate optimal meeting slots.</li>
                  <li>All workspace and member data is protected by secure access controls.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
