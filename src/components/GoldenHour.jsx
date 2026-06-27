import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateGoldenHour } from '../lib/engine';
import { Zap, Users } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 text-xs">
        <p className="font-bold text-white mb-1">{String(label).padStart(2, '0')}:00 UTC</p>
        <p className="text-primary">{payload[0].value} members available</p>
        <p className="text-muted mt-1">{payload[0].payload.attendees.join(', ') || 'None'}</p>
      </div>
    );
  }
  return null;
};

export default function GoldenHour({ members }) {
  const data = useMemo(() => calculateGoldenHour(members), [members]);

  if (!data || members.length < 2) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted">
          <Zap size={48} className="mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-white">Not Enough Data</h2>
          <p>Add at least 2 team members to generate the Golden Hour visualization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full filter blur-[40px]"></div>
          <div className="relative z-10">
            <p className="text-muted text-sm mb-2 flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> Golden Hour</p>
            <h3 className="text-3xl font-bold text-gradient">{String(data.bestHour).padStart(2, '0')}:00 <span className="text-lg text-muted font-normal">UTC</span></h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay:0.1}} className="glass rounded-2xl p-6">
          <p className="text-muted text-sm mb-2 flex items-center gap-2"><Users size={14} className="text-primary" /> Availability Score</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold">{data.score.toFixed(0)}%</h3>
            <span className="text-muted mb-1">({data.maxOverlap}/{members.length} people)</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay:0.2}} className="glass rounded-2xl p-6 flex flex-col justify-center">
          <p className="text-muted text-sm mb-2">Attendees</p>
          <div className="flex flex-wrap gap-2">
            {data.bestAttendees.map(a => (
              <span key={a} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg">{a}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Chart Visualization */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay:0.3}} className="glass rounded-2xl p-6 flex-1 min-h-[400px] flex flex-col">
        <h3 className="text-lg font-semibold mb-6">24-Hour Overlap Heatmap</h3>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.heatmapData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOverlap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7C5CFF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tickFormatter={(i) => `${String(i).padStart(2, '0')}:00`} stroke="#94A3B8" fontSize={12} />
              <YAxis domain={[0, members.length]} stroke="#94A3B8" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="overlap" stroke="#4F8CFF" strokeWidth={3} fillOpacity={1} fill="url(#colorOverlap)" dot={false} activeDot={{ r: 6, fill: '#4F8CFF', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
