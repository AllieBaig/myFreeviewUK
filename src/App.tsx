import React, { useState, useEffect } from 'react';
import { Programme, UserStats } from './types';
import { getTodaysSchedule } from './services/offline';
import { ProgrammeGrid } from './components/ProgrammeGrid';
import { GamificationHeader } from './components/GamificationHeader';
import { ProgrammeDetail } from './components/ProgrammeDetail';
import { ProfileView } from './components/ProfileView';
import { motion, AnimatePresence } from 'motion/react';
import { Tv, Search, Settings, Bell, Calendar, User, Play, WifiOff, Share, X, Sun, Moon } from 'lucide-react';
import { get, set } from 'idb-keyval';

const STATS_KEY = 'freeview_user_stats';
const PREFS_KEY = 'freeview_user_prefs';
const THEME_KEY = 'freeview_theme';

export default function App() {
  const [view, setView] = useState<'epg' | 'profile'>('epg');
  const [category, setCategory] = useState<string>('All');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);
  const [playingProgramme, setPlayingProgramme] = useState<Programme | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stats, setStats] = useState<UserStats>({
    xp: 1250,
    level: 2,
    streak: 4,
    lastCheckIn: new Date().toISOString(),
    achievements: ['Early Bird', 'Drama King', 'Night Owl', 'News Junkie'],
    uid: 'local-user',
    layoutMode: 'standard'
  });

  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // iOS PWA Detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    
    if (isIOS && !isStandalone) {
      const lastPrompt = localStorage.getItem('ios-install-prompt-last-shown');
      const now = Date.now();
      // Show prompt if not shown in the last 24 hours
      if (!lastPrompt || now - parseInt(lastPrompt) > 24 * 60 * 60 * 1000) {
        setShowInstallPrompt(true);
      }
    }

    const loadData = async () => {
      try {
        const [scheduleData, savedStats, savedPrefs, savedTheme] = await Promise.all([
          getTodaysSchedule(),
          get<UserStats>(STATS_KEY),
          get<string[]>(PREFS_KEY),
          get<'dark' | 'light'>(THEME_KEY)
        ]);

        setProgrammes(scheduleData);
        if (savedStats) setStats(savedStats);
        if (savedPrefs) setFavorites(savedPrefs);
        if (savedTheme) setTheme(savedTheme);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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

  const handlePlay = async (p: Programme) => {
    const newXp = stats.xp + 100;
    const newLevel = Math.floor(newXp / 1000) + 1;
    const newStats = {
      ...stats,
      xp: newXp,
      level: newLevel,
    };
    setStats(newStats);
    await set(STATS_KEY, newStats);
    console.log(`Playing: ${p.title}`);
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    await set(THEME_KEY, newTheme);
  };

  const toggleLayoutMode = async () => {
    const newMode = stats.layoutMode === 'minimal' ? 'standard' : 'minimal';
    const newStats = { ...stats, layoutMode: newMode };
    setStats(newStats);
    await set(STATS_KEY, newStats);
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
    <div className={cn(
      "h-screen w-screen flex flex-col transition-colors duration-500",
      theme === 'dark' ? "bg-[#0a0a0a] text-white" : "bg-[#f5f5f5] text-black"
    )}>
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <nav className={cn(
          "w-20 border-r flex flex-col items-center py-8 gap-8 transition-colors",
          theme === 'dark' ? "bg-[#111] border-white/10" : "bg-white border-black/5"
        )}>
          <button 
            onClick={() => setView('epg')}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              view === 'epg' 
                ? (theme === 'dark' ? "bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white" : "bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.2)] text-white")
                : (theme === 'dark' ? "bg-white/5 opacity-40 hover:opacity-100 text-white" : "bg-black/5 opacity-40 hover:opacity-100 text-black")
            )}
          >
            <Tv size={20} />
          </button>
          
          <div className="flex flex-col gap-6 opacity-40">
            <button className={cn("p-2 hover:opacity-100 transition-opacity", theme === 'dark' ? "text-white" : "text-black")}><Search size={20} /></button>
            <button className={cn("p-2 hover:opacity-100 transition-opacity", theme === 'dark' ? "text-white" : "text-black")}><Calendar size={20} /></button>
            <button className={cn("p-2 hover:opacity-100 transition-opacity", theme === 'dark' ? "text-white" : "text-black")}><Bell size={20} /></button>
          </div>
          
          <div className="mt-auto flex flex-col gap-6 items-center pb-4">
            <button 
              onClick={toggleTheme}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                theme === 'dark' ? "bg-white/5 text-yellow-400 hover:bg-white/10" : "bg-black/5 text-blue-600 hover:bg-black/10"
              )}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button 
              onClick={() => setView('profile')}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                view === 'profile' 
                  ? (theme === 'dark' ? "bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.4)] text-white" : "bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.2)] text-white")
                  : (theme === 'dark' ? "bg-white/5 opacity-40 hover:opacity-100 text-white" : "bg-black/5 opacity-40 hover:opacity-100 text-black")
              )}
            >
              <User size={20} />
            </button>
            <button className={cn("p-2 opacity-40 hover:opacity-100 transition-opacity", theme === 'dark' ? "text-white" : "text-black")}><Settings size={20} /></button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col overflow-hidden relative">
          <GamificationHeader stats={stats} onProfileClick={() => setView('profile')} />
          
          {/* Offline Indicator */}
          <AnimatePresence>
            {isOffline && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={cn(
                  "border-b px-6 py-2 flex items-center gap-3",
                  theme === 'dark' ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-500/5 border-amber-500/10"
                )}
              >
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <WifiOff size={14} className="text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">
                  Offline Mode — Using Cached Schedule
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Category Filter */}
          <div className={cn(
            "flex items-center gap-2 px-6 py-3 border-b overflow-x-auto no-scrollbar transition-colors",
            theme === 'dark' ? "bg-[#0d0d0d] border-white/5" : "bg-white border-black/5"
          )}>
            {['All', 'Favorites', 'Movies', 'TV Shows', 'Reality', 'News', 'Drama', 'Sports', 'Documentary'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  category === cat 
                    ? (theme === 'dark' ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-black text-white shadow-[0_0_15px_rgba(0,0,0,0.1)]")
                    : (theme === 'dark' ? "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white" : "bg-black/5 text-black/40 hover:bg-black/10 hover:text-black")
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dynamic Mini Player */}
          <AnimatePresence>
            {playingProgramme && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={cn(
                  "border-b overflow-hidden relative group transition-colors",
                  theme === 'dark' ? "bg-black border-white/10" : "bg-white border-black/10"
                )}
              >
                <div className="aspect-video w-full max-h-[40vh] relative">
                  <img 
                    src={`https://picsum.photos/seed/${playingProgramme.id}/1920/1080?blur=2`} 
                    className="w-full h-full object-cover opacity-50"
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={cn(
                      "w-20 h-20 rounded-full backdrop-blur-md flex items-center justify-center border",
                      theme === 'dark' ? "bg-white/10 border-white/20" : "bg-black/10 border-black/20"
                    )}>
                      <Play size={40} fill={theme === 'dark' ? "white" : "black"} className="ml-2" />
                    </div>
                  </div>
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t",
                    theme === 'dark' ? "from-black to-transparent" : "from-white to-transparent"
                  )}>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="px-2 py-1 bg-red-600 text-[10px] font-black uppercase rounded mb-2 inline-block text-white">Live Stream</span>
                        <h2 className="text-3xl font-black tracking-tighter">{playingProgramme.title}</h2>
                        <p className={cn("text-sm max-w-2xl mt-2", theme === 'dark' ? "opacity-60" : "opacity-80")}>{playingProgramme.description}</p>
                      </div>
                      <button 
                        onClick={() => setPlayingProgramme(null)}
                        className={cn(
                          "px-6 py-2 rounded-full text-xs font-bold transition-all",
                          theme === 'dark' ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/10 hover:bg-black/20 text-black"
                        )}
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
                    category={category}
                    theme={theme}
                    layoutMode={stats.layoutMode}
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
                  <ProfileView 
                    stats={stats} 
                    favorites={favorites} 
                    theme={theme} 
                    onToggleLayout={toggleLayoutMode}
                  />
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

      {/* iOS Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={cn(
              "fixed bottom-6 left-6 right-6 z-[100] p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4",
              theme === 'dark' ? "bg-white text-black" : "bg-black text-white"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  theme === 'dark' ? "bg-black" : "bg-white"
                )}>
                  <Tv className={theme === 'dark' ? "text-white" : "text-black"} size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg leading-tight">Install Freeview+</h3>
                  <p className={cn("text-xs font-medium", theme === 'dark' ? "opacity-60" : "opacity-80")}>Add to home screen for the full offline experience.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowInstallPrompt(false);
                  localStorage.setItem('ios-install-prompt-last-shown', Date.now().toString());
                }}
                className={cn("p-1 rounded-full transition-colors", theme === 'dark' ? "hover:bg-black/5" : "hover:bg-white/10")}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={cn(
              "p-4 rounded-2xl flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest",
              theme === 'dark' ? "bg-black/5" : "bg-white/10"
            )}>
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center border",
                  theme === 'dark' ? "bg-white border-black/10" : "bg-black border-white/10"
                )}>
                  <Share size={14} />
                </div>
                <span>Share</span>
              </div>
              <div className={cn("h-8 w-px", theme === 'dark' ? "bg-black/10" : "bg-white/10")} />
              <div className="flex-grow">
                Tap the share button below and select <span className="text-blue-600">"Add to Home Screen"</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: ${theme === 'dark' ? '#0a0a0a' : '#f5f5f5'}; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${theme === 'dark' ? '#222' : '#ddd'}; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${theme === 'dark' ? '#333' : '#ccc'}; }
      `}} />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
