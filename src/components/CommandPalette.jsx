import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Moon, Sun, Trash2, ArrowRight, Sliders, CalendarDays } from "lucide-react";
import { searchCities } from "../lib/cities";

export default function CommandPalette({
  isOpen,
  onClose,
  addMember,
  isDark,
  setIsDark,
  clearTeam,
  alignOptimal,
  resetToToday
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [step, setStep] = useState("search"); // "search" | "name_input"
  const [selectedCity, setSelectedCity] = useState(null);
  const [newName, setNewName] = useState("");
  
  const inputRef = useRef(null);
  const nameInputRef = useRef(null);

  // Filter commands and cities
  const filteredCities = searchCities(query);
  const coreCommands = [
    {
      id: "align_optimal",
      label: "Optimize timeline (maximize overlap)",
      icon: Sliders,
      action: () => {
        alignOptimal();
        onClose();
      }
    },
    {
      id: "reset_today",
      label: "Reset planning view to today",
      icon: CalendarDays,
      action: () => {
        resetToToday();
        onClose();
      }
    },
    {
      id: "toggle_theme",
      label: `Switch to ${isDark ? "light" : "dark"} mode`,
      icon: isDark ? Sun : Moon,
      action: () => {
        setIsDark(!isDark);
        onClose();
      }
    },
    {
      id: "clear_team",
      label: "Reset timeline (clear all teammates)",
      icon: Trash2,
      action: () => {
        clearTeam();
        onClose();
      }
    }
  ].filter(cmd => cmd.label.toLowerCase().includes(query.toLowerCase()));

  const totalItems = filteredCities.length + coreCommands.length;

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setStep("search");
      setNewName("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedIndex >= totalItems) {
      setSelectedIndex(Math.max(0, totalItems - 1));
    }
  }, [totalItems, selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === "Enter") {
        e.preventDefault();
        triggerSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, totalItems, step, selectedCity, newName]);

  const triggerSelection = () => {
    if (step === "search") {
      const isCommand = selectedIndex < coreCommands.length;
      if (isCommand) {
        coreCommands[selectedIndex].action();
      } else {
        const cityIndex = selectedIndex - coreCommands.length;
        const city = filteredCities[cityIndex];
        if (city) {
          setSelectedCity(city);
          setStep("name_input");
          setTimeout(() => nameInputRef.current?.focus(), 50);
        }
      }
    } else if (step === "name_input") {
      handleCreateTeammate();
    }
  };

  const handleCreateTeammate = () => {
    const finalName = newName.trim() || `Teammate in ${selectedCity.name}`;
    addMember(finalName, selectedCity);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
        
        {/* TRANSLUCENT BACKDROP */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/20 dark:bg-black/60 backdrop-blur-[2px]"
        />

        {/* SPOTLIGHT MODAL WINDOW */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[440px] font-sans"
        >
          {step === "search" ? (
            <>
              {/* Custom Input Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-900 shrink-0">
                <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Where is your teammate? Search cities or commands..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 text-sm outline-none placeholder-zinc-400 font-medium font-sans"
                />
                <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-200/40 dark:border-zinc-700 shrink-0">
                  ESC
                </span>
              </div>

              {/* Fuzzy Results Lists */}
              <div className="flex-1 overflow-y-auto p-2">
                {totalItems === 0 ? (
                  <div className="py-12 text-center text-zinc-400 text-xs">
                    No matching cities or commands found.
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    
                    {/* Navigation System Commands */}
                    {coreCommands.length > 0 && (
                      <div className="px-3 py-1.5 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 select-none">
                        Actions
                      </div>
                    )}
                    {coreCommands.map((cmd, i) => {
                      const isSelected = selectedIndex === i;
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => {
                            setSelectedIndex(i);
                            cmd.action();
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                            isSelected 
                              ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white" 
                              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`} />
                            <span className="text-xs font-semibold">{cmd.label}</span>
                          </div>
                          {isSelected && <span className="text-[10px] text-zinc-400 font-mono">↵ Run</span>}
                        </button>
                      );
                    })}

                    {/* Dynamic Cities */}
                    {filteredCities.length > 0 && (
                      <div className="px-3 py-1.5 pt-3 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 select-none">
                        Cities
                      </div>
                    )}
                    {filteredCities.map((city, i) => {
                      const globalIndex = coreCommands.length + i;
                      const isSelected = selectedIndex === globalIndex;
                      return (
                        <button
                          key={city.name + city.timezone}
                          onClick={() => {
                            setSelectedIndex(globalIndex);
                            setSelectedCity(city);
                            setStep("name_input");
                            setTimeout(() => nameInputRef.current?.focus(), 50);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                            isSelected 
                              ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white" 
                              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <MapPin className={`w-3.5 h-3.5 ${isSelected ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`} />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{city.name}</p>
                              <p className="text-[10px] text-zinc-400 truncate">{city.country} • {city.timezone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSelected && <span className="text-[10px] text-zinc-400 font-mono">↵ Select</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* STEP 2: NAME INPUT */
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>Add teammate in <strong>{selectedCity.name}, {selectedCity.country}</strong></span>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                  What is their name or role?
                </label>
                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl px-4 py-3 border border-zinc-200/60 dark:border-zinc-800/80">
                  <input
                    ref={nameInputRef}
                    type="text"
                    placeholder="e.g. Sarah, Alex (Design)..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 text-sm font-semibold outline-none placeholder-zinc-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateTeammate();
                    }}
                  />
                  <button
                    onClick={handleCreateTeammate}
                    className="p-1.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 border-t border-zinc-100 dark:border-zinc-900 pt-4">
                <button
                  onClick={() => {
                    setStep("search");
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className="hover:text-zinc-600 dark:hover:text-zinc-200 underline underline-offset-4 cursor-pointer"
                >
                  ← Search another city
                </button>
                <span className="font-mono text-[10px]">Press ↵ Enter to confirm</span>
              </div>
            </div>
          )}

          {/* Bottom command status bar */}
          <div className="bg-zinc-50/50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 px-4 py-3 flex items-center justify-between text-[10px] text-zinc-400 shrink-0">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 font-mono">
                <kbd className="font-mono bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 px-1 py-0.5 rounded text-zinc-500">↑↓</kbd> Select
              </span>
              <span className="flex items-center gap-1 font-mono">
                <kbd className="font-mono bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 px-1 py-0.5 rounded text-zinc-500">↵</kbd> Confirm
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
