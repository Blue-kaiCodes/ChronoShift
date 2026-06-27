import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import GoldenHour from './components/GoldenHour'

export const ThemeContext = React.createContext();

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('chronoshift_team');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('chronoshift_team', JSON.stringify(members));
  }, [members]);

  const addMember = (name, offset) => {
    const colors = ['#4F8CFF', '#7C5CFF', '#4ade80', '#fb923c', '#f472b6', '#facc15', '#22d3ee', '#f87171'];
    setMembers(prev => [...prev, { id: Date.now(), name, offset: parseFloat(offset), color: colors[prev.length % colors.length] }]);
  };

  const removeMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <div className="app-container">
        <Sidebar view={view} setView={setView} />
        <main className="main-content">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full filter blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full filter blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto h-full">
            {view === 'dashboard' && <Dashboard members={members} addMember={addMember} removeMember={removeMember} setView={setView} />}
            {view === 'golden' && <GoldenHour members={members} />}
          </div>
        </main>
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#151D31', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' } }} />
      </div>
    </ThemeContext.Provider>
  );
}
