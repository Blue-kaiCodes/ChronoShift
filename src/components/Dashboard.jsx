import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Users, Clock, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateGoldenHour } from '../lib/engine';

const timezones = [
  { city: "Pago Pago", offset: -11 }, { city: "Honolulu", offset: -10 }, { city: "Anchorage", offset: -9 },
  { city: "Los Angeles", offset: -7 }, { city: "Phoenix", offset: -7 }, { city: "Denver", offset: -6 },
  { city: "Chicago", offset: -5 }, { city: "New York", offset: -4 }, { city: "Santiago", offset: -4 },
  { city: "Sao Paulo", offset: -3 }, { city: "Buenos Aires", offset: -3 }, { city: "Nuuk", offset: -2 },
  { city: "Ponta Delgada", offset: -1 }, { city: "London", offset: 1 }, { city: "Lisbon", offset: 1 },
  { city: "Paris", offset: 2 }, { city: "Berlin", offset: 2 }, { city: "Cairo", offset: 2 },
  { city: "Johannesburg", offset: 2 }, { city: "Moscow", offset: 3 }, { city: "Istanbul", offset: 3 },
  { city: "Nairobi", offset: 3 }, { city: "Dubai", offset: 4 }, { city: "Karachi", offset: 5 },
  { city: "Mumbai", offset: 5.5 }, { city: "New Delhi", offset: 5.5 }, { city: "Dhaka", offset: 6 },
  { city: "Bangkok", offset: 7 }, { city: "Jakarta", offset: 7 }, { city: "Singapore", offset: 8 },
  { city: "Hong Kong", offset: 8 }, { city: "Shanghai", offset: 8 }, { city: "Taipei", offset: 8 },
  { city: "Perth", offset: 8 }, { city: "Tokyo", offset: 9 }, { city: "Seoul", offset: 9 },
  { city: "Sydney", offset: 10 }, { city: "Melbourne", offset: 10 }, { city: "Auckland", offset: 12 },
  { city: "Fiji", offset: 12 }, { city: "Tuvalu", offset: 13 }, { city: "Kiribati", offset: 14 }
];

export default function Dashboard({ members, addMember, removeMember, setView }) {
  const [name, setName] = useState('');
  const [tz, setTz] = useState(timezones[3].offset);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Enter a name");
    addMember(name, tz);
    toast.success(`${name} added successfully!`);
    setName('');
  };

  const getLocalTime = (offset) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * offset)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const syncData = useMemo(() => calculateGoldenHour(members), [members]);

  let syncStatusText = "Add more members";
  let StatusIcon = AlertCircle;
  let statusColorClass = "text-yellow-400";

  if (members.length >= 2) {
    if (syncData.score === 100) {
      syncStatusText = "Perfect Overlap";
      StatusIcon = CheckCircle;
      statusColorClass = "text-green-400";
    } else if (syncData.score >= 50) {
      syncStatusText = `${syncData.score.toFixed(0)}% Overlap`;
      StatusIcon = Clock;
      statusColorClass = "text-primary";
    } else {
      syncStatusText = "Low Overlap";
      StatusIcon = AlertTriangle;
      statusColorClass = "text-red-400";
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      
      {/* FIX: Added h-full overflow-hidden here so it doesn't push the right side down */}
      <div className="lg:col-span-1 flex flex-col gap-6 h-full overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><UserPlus size={20} /></div>
            <h2 className="text-lg font-semibold">Add Teammate</h2>
          </div>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <input type="text" placeholder="Name (e.g. Sarah)" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-dark-900/50 border border-white/5 rounded-xl text-white placeholder-muted focus:outline-none focus:border-primary/50 transition-colors" />
            <select value={tz} onChange={(e) => setTz(e.target.value)} className="w-full px-4 py-3 bg-dark-900/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
              {timezones.map(t => (
                <option key={t.city} value={t.offset} className="bg-dark-800 text-white">{t.city} (UTC{t.offset >= 0 ? '+' : ''}{t.offset})</option>
              ))}
            </select>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl shadow-glow hover:shadow-lg transition-shadow">
              Add to Team
            </motion.button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 flex-1 overflow-y-auto min-h-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/10 rounded-xl text-accent"><Users size={20} /></div>
            <h2 className="text-lg font-semibold">Active Team</h2>
            <span className="ml-auto bg-dark-700 px-2 py-0.5 rounded-full text-xs text-muted">{members.length}</span>
          </div>
          
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {members.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center justify-between p-3 bg-dark-900/30 rounded-xl border border-white/5 group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }}></div>
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted flex items-center gap-1"><Clock size={10} /> {getLocalTime(m.offset)}</p>
                    </div>
                  </div>
                  <button onClick={() => removeMember(m.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1">
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {members.length === 0 && <p className="text-sm text-muted text-center py-8">No members added yet.</p>}
          </div>
        </motion.div>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 flex flex-col justify-between h-40">
            <p className="text-muted text-sm">Total Team Members</p>
            <motion.h2 className="text-4xl font-bold text-gradient" key={members.length} initial={{ scale: 0.5 }} animate={{ scale: 1 }}>{members.length}</motion.h2>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 flex flex-col justify-between h-40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full filter blur-[40px]"></div>
            <p className="text-muted text-sm z-10">Current Sync Status</p>
            <div className="flex items-center gap-3 z-10">
              <StatusIcon size={24} className={statusColorClass} />
              <span className="text-xl font-bold">{syncStatusText}</span>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-8 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="blob w-40 h-40 bg-accent top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '2s'}}></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3">Find Your Golden Hour</h2>
            <p className="text-muted max-w-md mb-6">Add at least 2 team members from different timezones, then navigate to the Golden Hour tab to visualize the perfect meeting time.</p>
            {members.length >= 2 && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-white text-dark-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow" onClick={() => setView('golden')}>
                View Golden Hour →
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
