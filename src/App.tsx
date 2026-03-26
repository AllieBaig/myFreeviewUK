import React, { useState, useEffect } from 'react';
import { Programme, UserStats } from './types';
import { getTodaysSchedule } from './services/offline';
import { ProgrammeGrid } from './components/ProgrammeGrid';
import { GamificationHeader } from './components/GamificationHeader';
import { ProgrammeDetail } from './components/ProgrammeDetail';
import { ProfileView } from './components/ProfileView';
import { motion, AnimatePresence } from 'motion/react';
import { Tv, Search, Settings, Bell, Calendar, User, Play } from 'lucide-react';
import { get, set } from 'idb-keyval';

const STATS_KEY = 'freeview_user_stats';
const PREFS_KEY = 'freeview_user_prefs';

export default function App() {
  const [view, setView] = useState<'epg' | 'profile'>('epg');
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);
  const [playingProgramme, setPlayingProgramme] = useState<Programme | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stats, setStats] = useState<UserStats>({
    xp: 1250,
    level: 2,
    streak: 4,
    lastCheckIn: new Date().toISOString(),
    achievements: ['Early Bird', 'Drama King', 'Night Owl', 'News Junkie'],
    uid: 'local-user'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [scheduleData, savedStats, savedPrefs] = await Promise.all([
          getTodaysSchedule(),
          get<UserStats>(STATS_KEY),
          get<string[]>(PREFS_KEY)
        ]);

        setProgrammes(scheduleData);
        if (savedStats) setStats(savedStats);
        if (savedPrefs) setFavorites(savedPrefs);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleFavorite = async (channelId: string) => {
    const newFavs = favorites.includes(channelId)
      ? favorites.filter(id => id !== channelId)
      : [...favorites, channelId];
    setFavorites(newFavs);
    await set(PREFS_KEY, newFavs);
  };

  const handleCheckIn = async (p: Programme) => {
    const newXp = stats.xp + 50;
    const newLevel = Math.floor(newXp / 1000) + 1;
    const newStats = {
      ...stats,
      xp: newXp,
      level: newLevel,
      lastCheckIn: new Date().toISOString()
    };
    setStats(newStats);
    await set(STATS_KEY, newStats);
    setSelectedProgramme(null);
  };

  const handlePlay = (p: Programme) => {
    setPlayingProgramme(p);
    // Auto check-in when playing
    handleCheckIn(p);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest animate-pulse">
          Initializing Offline Guide...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <nav className="w-20 bg-[#111] border-r border-white/10 flex flex-col items-center py-8 gap-8">
          <button 
            onClick={() => setView('epg')}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              view === 'epg' ? "bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-white/5 opacity-40 hover:opacity-100"
            )}
          >
            <Tv size={20} />
          </button>
          
          <div className="flex flex-col gap-6 opacity-40">
            <button className="p-2 hover:opacity-100 transition-opacity"><Search size={20} /></button>
            <button className="p-2 hover:opacity-100 transition-opacity"><Calendar size={20} /></button>
            <button className="p-2 hover:opacity-100 transition-opacity"><Bell size={20} /></button>
          </div>
          
          <div className="mt-auto flex flex-col gap-6 items-center pb-4">
            <button 
              onClick={() => setView('profile')}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                view === 'profile' ? "bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.4)]" : "bg-white/5 opacity-40 hover:opacity-100"
              )}
            >
              <User size={20} />
            </button>
            <button className="p-2 opacity-40 hover:opacity-100 transition-opacity"><Settings size={20} /></button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col overflow-hidden relative">
          <GamificationHeader stats={stats} onProfileClick={() => setView('profile')} />
          
          {/* Dynamic Mini Player */}
          <AnimatePresence>
            {playingProgramme && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-black border-b border-white/10 overflow-hidden relative group"
              >
                <div className="aspect-video w-full max-h-[40vh] relative">
                  <img 
                    src={`https://picsum.photos/seed/${playingProgramme.id}/1920/1080?blur=2`} 
                    className="w-full h-full object-cover opacity-50"
                    alt=""
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Play size={40} fill="white" className="ml-2" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="px-2 py-1 bg-red-600 text-[10px] font-black uppercase rounded mb-2 inline-block">Live Stream</span>
                        <h2 className="text-3xl font-black tracking-tighter">{playingProgramme.title}</h2>
                        <p className="text-sm opacity-60 max-w-2xl mt-2">{playingProgramme.description}</p>
                      </div>
                      <button 
                        onClick={() => setPlayingProgramme(null)}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-all"
                      >
                        Close Stream
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-grow relative overflow-hidden">
            <AnimatePresence mode="wait">
              {view === 'epg' ? (
                <motion.div 
                  key="epg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full"
                >
                  <ProgrammeGrid 
                    programmes={programmes} 
                    onProgrammeSelect={setSelectedProgramme}
                    onProgrammePlay={handlePlay}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full overflow-y-auto custom-scrollbar"
                >
                  <ProfileView stats={stats} favorites={favorites} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      <ProgrammeDetail 
        programme={selectedProgramme} 
        onClose={() => setSelectedProgramme(null)}
        onCheckIn={handleCheckIn}
        onPlay={handlePlay}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
      `}} />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
