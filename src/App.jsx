import React, { useState, useEffect, useMemo, useRef } from "react";
import { Toaster } from "react-hot-toast";
import {
  Search,
  Plus,
  Sun,
  Moon,
  CalendarDays,
  RefreshCw,
  LayoutDashboard,
  Clock,
  Users,
  History,
  Settings as SettingsIcon,
  Bell,
  ChevronDown,
  Layers,
  LogOut,
  Sparkles,
  HelpCircle,
  Menu,
  Check,
  Globe,
  Trash2,
  Lock,
  ArrowRight
} from "lucide-react";
import { useSaaSStore } from "./lib/store";
import { db as dbInstance } from "./lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import LandingPage from "./components/LandingPage";
import AuthModal from "./components/AuthModal";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import TimelinePlanner from "./components/TimelinePlanner";
import TeamView from "./components/TeamView";
import HistoryView from "./components/HistoryView";
import SettingsView from "./components/SettingsView";
import CommandPalette from "./components/CommandPalette";
import ShortcutsModal from "./components/ShortcutsModal";
import { calculateTimelineData } from "./lib/engine";
import toast from "react-hot-toast";

export default function App() {
  const store = useSaaSStore();
  const {
    db,
    currentUser,
    currentWorkspace,
    workspaceUsers,
    setCurrentWorkspace,
    registerUser,
    loginUser,
    logoutUser,
    updateProfile,
    createWorkspace,
    deleteWorkspace,
    inviteMemberByEmail,
    removeMember,
    updateMemberRoleAndTitle,
    acceptInvitation,
    logMeeting,
    markNotificationRead,
    clearAllNotifications,
    togglePinCity
  } = store;

  // Session Routing
  // If not logged in: "landing" | "auth"
  // If logged in: "dashboard" | "planner" | "team" | "history" | "settings"
  const [activeView, setActiveView] = useState("landing");
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("chronoshift_theme");
    return saved ? saved === "dark" : true;
  });

  // Calendar/Time states
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [activeHour, setActiveHour] = useState(14);
  const [referenceTimezone, setReferenceTimezone] = useState("Europe/London");

  // Interactive controls
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [showWorkspaceCreateModal, setShowWorkspaceCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceType, setNewWorkspaceType] = useState("Startup");

  // Element reference for closing dropdowns on outer click
  const workspaceDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Auto-redirect to appropriate page based on auth state
  useEffect(() => {
    if (currentUser) {
      if (!currentUser.onboardingCompleted) {
        setActiveView("onboarding");
      } else if (activeView === "landing" || activeView === "auth" || activeView === "onboarding") {
        setActiveView("dashboard");
      }
    } else {
      if (activeView !== "landing" && activeView !== "auth") {
        setActiveView("landing");
      }
    }
  }, [currentUser]);

  // Handle reference timezone detection on auth
  useEffect(() => {
    if (currentUser && currentUser.timezone) {
      setReferenceTimezone(currentUser.timezone);
    }
  }, [currentUser]);

  // Sync theme to DOM and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("chronoshift_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("chronoshift_theme", "light");
    }
  }, [isDark]);

  // Close popovers on outer click
  useEffect(() => {
    const handleOuterClick = (e) => {
      if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(e.target)) {
        setIsWorkspaceDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOuterClick);
    return () => document.removeEventListener("mousedown", handleOuterClick);
  }, []);

  // Global Power-User Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when user is typing in form inputs
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
        return;
      }

      // Command Palette (Cmd+K / Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
        return;
      }

      // Shortcuts Guide (?)
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
        return;
      }

      // Snap to optimal golden hour (G)
      if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        alignOptimal();
        return;
      }

      // Reset to today (T)
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        resetToToday();
        toast.success("Reset calendar view to today");
        return;
      }

      // Step calendar date back/forward (Left/Right Arrows)
      if (e.key === "ArrowLeft" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        adjustDate(-1);
        return;
      }
      if (e.key === "ArrowRight" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        adjustDate(1);
        return;
      }

      // Quick switcher tabs via Alt + Number (1-5)
      if (e.altKey && !isNaN(e.key)) {
        const viewMap = ["dashboard", "planner", "team", "history", "settings"];
        const target = viewMap[parseInt(e.key) - 1];
        if (target) {
          e.preventDefault();
          setActiveView(target);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [workspaceUsers, currentDate, referenceTimezone]);

  // Workspace lists of current authenticated user
  const myWorkspaces = useMemo(() => {
    if (!currentUser) return [];
    return db.workspaces.filter(w =>
      w.members.some(m => m.userId === currentUser.id)
    );
  }, [db.workspaces, currentUser]);

  // Active notifications of the user
  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return db.notifications.filter(n => n.userId === currentUser.id);
  }, [db.notifications, currentUser]);

  const unreadNotifCount = useMemo(() => {
    return userNotifications.filter(n => !n.read).length;
  }, [userNotifications]);

  // Date steppers
  const adjustDate = (days) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + days);
      return next;
    });
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  const alignOptimal = () => {
    const res = calculateTimelineData(workspaceUsers, currentDate, referenceTimezone);
    if (res && res.bestHour !== undefined) {
      setActiveHour(res.bestHour);
      toast.success(`Scrubber moved to optimal core overlap window: ${res.bestHour}:00 reference!`);
    }
  };

  const handleAuthSuccess = async () => {
    try {
      await store.loginWithGoogle();
    } catch (e) {
      console.error(e);
    }
  };

  const handleOnboardingComplete = (fields) => {
    updateProfile({
      ...fields,
      onboardingCompleted: true
    });
    setActiveView("dashboard");
    toast.success("Welcome aboard ChronoShift! Dynamic scheduling matrices are live.");
  };

  const handleCreateWorkspaceSubmit = (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    createWorkspace(newWorkspaceName, newWorkspaceType);
    setNewWorkspaceName("");
    setShowWorkspaceCreateModal(false);
  };

  const handlePlannerAddMember = async (name, city) => {
    if (!currentWorkspace) return;
    const randomColors = ["#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];
    const newUid = `user-${Date.now()}`;
    const newUser = {
      id: newUid,
      uid: newUid,
      email: `${name.toLowerCase().replace(/\s+/g, "")}@chronoshift.co`,
      fullName: name,
      username: name.toLowerCase().replace(/\s+/g, "_"),
      avatarColor: randomColors[Math.floor(Math.random() * randomColors.length)],
      bio: `Workspace contributor based in ${city.name}`,
      country: city.country,
      city: city.name,
      timezone: city.timezone,
      workStart: 9,
      workEnd: 17,
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(dbInstance, "users", newUid), newUser);
      const updatedMembers = [...(currentWorkspace.members || []), { userId: newUid, role: "Contributor", title: "Global Partner" }];
      const updatedMemberIds = [...(currentWorkspace.memberIds || []), newUid];
      const wsDocRef = doc(dbInstance, "workspaces", currentWorkspace.id);
      await setDoc(wsDocRef, { members: updatedMembers, memberIds: updatedMemberIds }, { merge: true });
      toast.success(`${name} linked to current workspace team!`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to add partner to workspace.");
    }
  };

  const handlePlannerRemoveMember = (memberId) => {
    removeMember(memberId);
  };

  const handlePlannerUpdateHours = async (memberId, start, end) => {
    try {
      const userDocRef = doc(dbInstance, "users", memberId);
      await setDoc(userDocRef, { workStart: start, workEnd: end }, { merge: true });
      toast.success("Member working hour offsets updated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update working hours.");
    }
  };

  // Log meeting directly inside workspace timeline history
  const handleLogMeetingInWorkspace = (title, durationMinutes) => {
    if (!currentWorkspace) return;
    logMeeting(
      title,
      currentDate.toISOString().split("T")[0],
      activeHour,
      durationMinutes,
      workspaceUsers.map(u => u.id)
    );
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors duration-200 font-sans">
      
      {/* LANDING PAGE ROUTING */}
      {activeView === "landing" && (
        <LandingPage
          onGetStarted={() => {
            setAuthMode("register");
            setActiveView("auth");
          }}
          onSignIn={() => {
            setAuthMode("login");
            setActiveView("auth");
          }}
        />
      )}

      {/* AUTHENTICATION SCREEN */}
      {activeView === "auth" && (
        <AuthModal
          initialView={authMode}
          onBackToLanding={() => setActiveView("landing")}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* GUIDED ONBOARDING STEPPER */}
      {activeView === "onboarding" && (
        <Onboarding
          currentUser={currentUser}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* PRINCIPAL DESKTOP WORKSPACE LAYOUT */}
      {activeView !== "landing" && activeView !== "auth" && activeView !== "onboarding" && currentUser && (
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {/* HEADER BAR */}
          <header className="h-16 border-b border-zinc-200/50 dark:border-zinc-900 px-6 flex items-center justify-between select-none shrink-0 bg-white dark:bg-[#0F0F11] transition-colors relative z-40">
            
            {/* Left Header Section: Logo + Workspace Dropdown */}
            <div className="flex items-center gap-4">
              <div 
                onClick={() => setActiveView("dashboard")} 
                className="flex items-center gap-2 cursor-pointer hover:opacity-90"
              >
                <div className="w-5 h-5 bg-zinc-950 dark:bg-white rounded flex items-center justify-center select-none shrink-0 font-mono text-[9px] font-black text-white dark:text-zinc-950">
                  //
                </div>
                <span className="font-mono font-bold text-xs tracking-wider uppercase text-zinc-950 dark:text-zinc-50">
                  ChronoShift
                </span>
              </div>

              <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

              {/* Workspace Selector */}
              <div className="relative" ref={workspaceDropdownRef}>
                <button
                  onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                  className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{currentWorkspace?.name}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {isWorkspaceDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-3 py-1.5 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-900 mb-1">
                      Active Workspaces
                    </div>
                    {myWorkspaces.map(ws => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          setCurrentWorkspace(ws);
                          setIsWorkspaceDropdownOpen(false);
                          toast.success(`Switched to workspace: "${ws.name}"`);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                          currentWorkspace?.id === ws.id
                            ? "bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40"
                        }`}
                      >
                        <span>{ws.name}</span>
                        {currentWorkspace?.id === ws.id && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                      </button>
                    ))}
                    
                    <div className="border-t border-zinc-100 dark:border-zinc-900 my-1.5" />
                    <button
                      onClick={() => {
                        setIsWorkspaceDropdownOpen(false);
                        setShowWorkspaceCreateModal(true);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-indigo-500 hover:bg-zinc-50 dark:hover:bg-indigo-950/20 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Workspace</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Central Navigation Command Pallete Bar */}
            <div className="hidden md:flex items-center justify-center flex-1 max-w-sm mx-4">
              <button
                onClick={() => setIsPaletteOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Search cities, quick coordinates...</span>
                </span>
                <kbd className="font-mono bg-white dark:bg-[#1A1A1E] border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-400 shadow-sm shrink-0">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Right Side Header Items: View Selectors, Toggles, Notifications, User Avatar */}
            <div className="flex items-center gap-4">
              
              {/* TABS SELECTOR */}
              <div className="hidden lg:flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
                {[
                  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                  { id: "planner", label: "Planner", icon: Clock },
                  { id: "team", label: "Team", icon: Users },
                  { id: "history", label: "Logs", icon: History },
                  { id: "settings", label: "Settings", icon: SettingsIcon }
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeView === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveView(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* DATE PAGER CONTROLS */}
              {activeView === "planner" && (
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-zinc-200/30 dark:border-zinc-800">
                  <button
                    onClick={() => adjustDate(-1)}
                    className="p-1 px-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded hover:bg-white dark:hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    ←
                  </button>
                  <span className="px-2.5 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <button
                    onClick={() => adjustDate(1)}
                    className="p-1 px-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded hover:bg-white dark:hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    →
                  </button>
                </div>
              )}

              {/* NOTIFICATION DROP-OVER BELL */}
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                  className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 border border-zinc-200/30 dark:border-zinc-800 relative cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>

                {isNotifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-2 z-50 max-h-80 overflow-y-auto">
                    <div className="px-3 py-1.5 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-900 mb-2 flex justify-between items-center">
                      <span>Notifications</span>
                      {userNotifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-[9px] text-red-500 hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {userNotifications.length > 0 ? (
                      <div className="space-y-1">
                        {userNotifications.map(n => (
                          <div
                            key={n.id}
                            className={`px-3 py-2 text-xs border-b border-zinc-50 dark:border-zinc-900/60 last:border-0 ${
                              n.read ? "opacity-75" : "bg-indigo-500/5 font-medium"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200">{n.title}</span>
                              {!n.read && (
                                <button
                                  onClick={() => markNotificationRead(n.id)}
                                  className="text-[9px] text-indigo-500 hover:underline"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">{n.message}</p>
                            
                            {/* Invitation Accept CTA */}
                            {n.inviteId && !n.accepted && (
                              <button
                                onClick={() => {
                                  acceptInvitation(n.inviteId, n.workspaceId, currentUser.id, n.role, n.titleName);
                                }}
                                className="mt-1.5 w-full py-1 bg-emerald-500 text-white font-bold text-[10px] rounded hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>Accept Invitation</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-zinc-400 text-[11px] font-mono">
                        Roster coordinate inbox empty
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Theme Toggler */}
              <button
                onClick={() => setIsDark(!isDark)}
                title="Toggle visual style"
                className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 border border-zinc-200/30 dark:border-zinc-800 cursor-pointer"
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* Keyboard Shortcuts Guide */}
              <button
                onClick={() => setIsShortcutsOpen(true)}
                title="Keyboard shortcuts (?)"
                className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 border border-zinc-200/30 dark:border-zinc-800 cursor-pointer hidden sm:flex items-center justify-center"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {/* User Avatar Action */}
              <div 
                onClick={() => setActiveView("settings")}
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white cursor-pointer select-none ring-2 ring-zinc-100 dark:ring-zinc-900"
                style={{ backgroundColor: currentUser?.avatarColor || "#3b82f6" }}
              >
                {(currentUser?.displayName || currentUser?.fullName || currentUser?.email || "U").charAt(0).toUpperCase()}
              </div>

            </div>
          </header>

          {/* PORTABLE MOBILE SHEETS NAVIGATION HEADER (visible on small screens) */}
          <div className="lg:hidden h-10 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200/60 dark:border-zinc-900 px-6 flex items-center justify-between select-none">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
              VIEWPORT CONTROL:
            </span>
            <div className="flex gap-3">
              {["dashboard", "planner", "team", "history", "settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveView(tab)}
                  className={`text-[10px] font-bold uppercase ${
                    activeView === tab ? "text-indigo-500" : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN CONTAINER CONTENT VIEWPORT */}
          <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl mx-auto w-full">
            {activeView === "dashboard" && (
              <Dashboard
                currentUser={currentUser}
                currentWorkspace={currentWorkspace}
                workspaceUsers={workspaceUsers}
                db={db}
                onNavigate={(v) => setActiveView(v)}
                onScheduleQuick={(slot) => {
                  setActiveHour(parseInt(slot.time.split(":")[0], 10) || 14);
                  setActiveView("planner");
                }}
                onInviteQuick={(email) => {
                  inviteMemberByEmail(email, "Contributor", "Global Partner");
                }}
              />
            )}

            {activeView === "planner" && (
              <TimelinePlanner
                members={workspaceUsers.map(u => ({
                  id: u.id,
                  name: u.displayName || u.fullName || u.email || "Anonymous",
                  city: u.city,
                  timezone: u.timezone,
                  color: u.avatarColor || "#71717a",
                  workStart: u.workStart ?? 9,
                  workEnd: u.workEnd ?? 17
                }))}
                removeMember={handlePlannerRemoveMember}
                updateMemberWorkHours={handlePlannerUpdateHours}
                referenceTimezone={referenceTimezone}
                setReferenceTimezone={setReferenceTimezone}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                openCommandPalette={() => setIsPaletteOpen(true)}
                activeHour={activeHour}
                setActiveHour={setActiveHour}
                onLogMeeting={handleLogMeetingInWorkspace}
              />
            )}

            {activeView === "team" && (
              <TeamView
                currentUser={currentUser}
                currentWorkspace={currentWorkspace}
                workspaceUsers={workspaceUsers}
                onInvite={(email, role, title) => inviteMemberByEmail(email, role, title)}
                onRemoveMember={(userId) => removeMember(userId)}
                onUpdateRole={(userId, role, title) => updateMemberRoleAndTitle(userId, role, title)}
              />
            )}

            {activeView === "history" && (
              <HistoryView
                currentWorkspace={currentWorkspace}
                workspaceUsers={workspaceUsers}
              />
            )}

            {activeView === "settings" && (
              <SettingsView
                currentUser={currentUser}
                currentWorkspace={currentWorkspace}
                onUpdateProfile={(fields) => updateProfile(fields)}
                onUpdateWorkspace={async (fields) => {
                  if (!currentWorkspace) return;
                  try {
                    const wsDocRef = doc(dbInstance, "workspaces", currentWorkspace.id);
                    await setDoc(wsDocRef, fields, { merge: true });
                    toast.success("Workspace specifications updated!");
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to update workspace specs.");
                  }
                }}
                onDeleteWorkspace={(id) => {
                  deleteWorkspace(id);
                  setActiveView("dashboard");
                }}
                onLogout={() => {
                  logoutUser();
                  setActiveView("landing");
                }}
              />
            )}
          </main>

        </div>
      )}

      {/* COMMAND PALETTE WINDOW (Spotlight lookup) */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        addMember={handlePlannerAddMember}
        isDark={isDark}
        setIsDark={setIsDark}
        clearTeam={async () => {
          if (currentWorkspace && currentUser) {
            try {
              const wsDocRef = doc(dbInstance, "workspaces", currentWorkspace.id);
              await setDoc(wsDocRef, {
                members: currentWorkspace.members.filter(m => m.userId === currentUser.uid),
                memberIds: [currentUser.uid]
              }, { merge: true });
              toast.success("Roster purges synchronized!");
            } catch (e) {
              console.error(e);
              toast.error("Failed to purge roster.");
            }
          }
        }}
        alignOptimal={alignOptimal}
        resetToToday={resetToToday}
      />

      {/* CREATE WORKSPACE MODAL */}
      {showWorkspaceCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/20 dark:bg-black/60 backdrop-blur-[2px]" onClick={() => setShowWorkspaceCreateModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white mb-1.5">Create New Team Workspace</h3>
            <span className="text-[10px] text-zinc-400 font-mono block uppercase mb-4">MAP GLOBAL TEAM COLLABORATORS</span>
            
            <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Design & Engineering Hub"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Corporate Type
                </label>
                <select
                  value={newWorkspaceType}
                  onChange={(e) => setNewWorkspaceType(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <option>Startup</option>
                  <option>Freelance</option>
                  <option>Personal</option>
                  <option>University</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold rounded-xl hover:opacity-95 transition-all cursor-pointer"
                >
                  Instantiate Workspace
                </button>
                <button
                  type="button"
                  onClick={() => setShowWorkspaceCreateModal(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RAYCAST COMMAND PALETTE (CMD+K) */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        addMember={(name, city) => handlePlannerAddMember(name, city)}
        isDark={isDark}
        setIsDark={setIsDark}
        clearTeam={() => {
          toast.success("Timeline reset");
        }}
        alignOptimal={alignOptimal}
        resetToToday={resetToToday}
      />

      {/* KEYBOARD SHORTCUTS HUD (?) */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Real-time styled minimalist toast notifications */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: isDark ? "#141416" : "#ffffff",
            color: isDark ? "#f4f4f5" : "#1c1a17",
            border: isDark ? "1px solid #222225" : "1px solid #e5e4e0",
            borderRadius: "12px",
            fontSize: "11px",
            fontFamily: "monospace",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 9999
          }
        }}
      />
    </div>
  );
}
