import React from 'react';
import { UserStats, CHANNELS } from '../types';
import { motion } from 'motion/react';
import { Trophy, Flame, Star, Zap, Clock, Shield, HardDrive, WifiOff, RefreshCcw, Trash2, Settings } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileViewProps {
  stats: UserStats;
  favorites: string[];
  theme: 'dark' | 'light';
  onToggleLayout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ stats, favorites, theme, onToggleLayout }) => {
  const favoriteChannelData = CHANNELS.filter(c => favorites.includes(c.id));
  const progress = (stats.xp % 1000) / 10;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter mb-2">Your Profile</h1>
        <p className={cn(
          "font-mono text-sm uppercase tracking-widest",
          theme === 'dark' ? "text-white/40" : "text-black/40"
        )}>Local Viewer ID: {stats.uid}</p>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {/* Main Level Block */}
        <motion.div 
          variants={itemVariants}
          className={cn(
            "col-span-1 md:col-span-2 row-span-2 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-2xl transition-colors",
            theme === 'dark' 
              ? "bg-gradient-to-br from-blue-600 to-purple-700 shadow-blue-500/20" 
              : "bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/10"
          )}
        >
          <div>
            <div className={cn(
              "w-20 h-20 rounded-3xl backdrop-blur-xl flex items-center justify-center mb-6 border",
              theme === 'dark' ? "bg-white/20 border-white/30" : "bg-white/40 border-white/50"
            )}>
              <Zap size={40} className="text-white" />
            </div>
            <h2 className="text-4xl font-black mb-2 text-white">Level {stats.level}</h2>
            <p className="text-white/70 text-lg">You're in the top 5% of viewers this week!</p>
          </div>
          <div className="mt-12">
            <div className="flex justify-between items-end mb-4">
              <span className="text-sm font-bold uppercase tracking-widest opacity-80 text-white">Progress to Level {stats.level + 1}</span>
              <span className="text-2xl font-black text-white">{stats.xp % 1000} <span className="text-sm opacity-60">/ 1000 XP</span></span>
            </div>
            <div className="w-full h-4 bg-black/20 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
              />
            </div>
          </div>
        </motion.div>

        {/* Streak Block */}
        <motion.div 
          variants={itemVariants}
          className={cn(
            "rounded-[2.5rem] p-8 border flex flex-col items-center justify-center text-center group hover:border-orange-500/30 transition-colors",
            theme === 'dark' ? "bg-[#1a1a1a] border-white/5" : "bg-white border-black/5"
          )}
        >
          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Flame size={32} className="text-orange-500" />
          </div>
          <span className="text-4xl font-black text-orange-500">{stats.streak}</span>
          <span className={cn(
            "text-xs font-bold uppercase tracking-widest mt-1",
            theme === 'dark' ? "opacity-40" : "opacity-60"
          )}>Day Streak</span>
        </motion.div>

        {/* Offline Status Block */}
        <motion.div 
          variants={itemVariants}
          className={cn(
            "rounded-[2.5rem] p-8 border flex flex-col items-center justify-center text-center transition-colors",
            theme === 'dark' ? "bg-[#1a1a1a] border-white/5" : "bg-white border-black/5"
          )}
        >
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <WifiOff size={32} className="text-green-500" />
          </div>
          <span className="text-xl font-black text-green-500">PWA Ready</span>
          <span className={cn(
            "text-[10px] font-mono mt-1 uppercase",
            theme === 'dark' ? "opacity-40" : "opacity-60"
          )}>Offline Support Active</span>
        </motion.div>

        {/* Achievements Block */}
        <motion.div 
          variants={itemVariants}
          className={cn(
            "col-span-1 md:col-span-2 rounded-[2.5rem] p-8 border transition-colors",
            theme === 'dark' ? "bg-[#1a1a1a] border-white/5" : "bg-white border-black/5"
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Trophy size={24} className="text-yellow-500" />
              Achievements
            </h3>
            <span className={cn(
              "text-xs font-mono",
              theme === 'dark' ? "opacity-40" : "opacity-60"
            )}>{stats.achievements.length} Unlocked</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {stats.achievements.map((achievement, i) => (
              <div key={i} className={cn(
                "px-4 py-2 rounded-xl border text-sm font-bold transition-colors cursor-default",
                theme === 'dark' ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-black/5 border-black/10 hover:bg-black/10"
              )}>
                {achievement}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Favorites Block */}
        <motion.div 
          variants={itemVariants}
          className={cn(
            "col-span-1 md:col-span-2 rounded-[2.5rem] p-8 border transition-colors",
            theme === 'dark' ? "bg-[#1a1a1a] border-white/5" : "bg-white border-black/5"
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Star size={24} className="text-blue-500" />
              Favorite Channels
            </h3>
            <span className={cn(
              "text-xs font-mono",
              theme === 'dark' ? "opacity-40" : "opacity-60"
            )}>{favorites.length} Saved</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {favoriteChannelData.map(channel => (
              <div key={channel.id} className={cn(
                "aspect-square rounded-2xl flex items-center justify-center p-4 border transition-all group",
                theme === 'dark' ? "bg-white/5 border-white/5 hover:border-white/20" : "bg-black/5 border-black/5 hover:border-black/20"
              )}>
                <img 
                  src={channel.logo} 
                  alt={channel.name} 
                  className="max-h-full object-contain brightness-75 group-hover:brightness-100 transition-all" 
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
            {favorites.length === 0 && (
              <div className={cn(
                "col-span-4 py-8 text-center text-sm italic",
                theme === 'dark' ? "opacity-30" : "opacity-50"
              )}>
                No favorites added yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Storage Info Block */}
        <motion.div 
          variants={itemVariants}
          className={cn(
            "rounded-[2.5rem] p-8 border flex flex-col justify-between transition-colors",
            theme === 'dark' ? "bg-[#1a1a1a] border-white/5" : "bg-white border-black/5"
          )}
        >
          <div className={cn(
            "flex items-center gap-3 mb-4",
            theme === 'dark' ? "opacity-40" : "opacity-60"
          )}>
            <HardDrive size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Local Storage</span>
          </div>
          <div>
            <span className="text-2xl font-black">1.2 MB</span>
            <p className={cn(
              "text-[10px] mt-1",
              theme === 'dark' ? "opacity-40" : "opacity-60"
            )}>EPG Cache & Preferences</p>
          </div>
        </motion.div>

        {/* Last Sync Block */}
        <motion.div 
          variants={itemVariants}
          className={cn(
            "rounded-[2.5rem] p-8 border flex flex-col justify-between transition-colors",
            theme === 'dark' ? "bg-[#1a1a1a] border-white/5" : "bg-white border-black/5"
          )}
        >
          <div className={cn(
            "flex items-center gap-3 mb-4",
            theme === 'dark' ? "opacity-40" : "opacity-60"
          )}>
            <Clock size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Last Update</span>
          </div>
          <div>
            <span className="text-xl font-black">{format(new Date(stats.lastCheckIn), 'HH:mm')}</span>
            <p className={cn(
              "text-[10px] mt-1",
              theme === 'dark' ? "opacity-40" : "opacity-60"
            )}>{format(new Date(stats.lastCheckIn), 'MMM dd, yyyy')}</p>
          </div>
        </motion.div>

        {/* Layout Mode Toggle */}
        <motion.div 
          variants={itemVariants}
          className={cn(
            "col-span-1 md:col-span-2 lg:col-span-4 rounded-[2.5rem] p-8 border flex flex-col md:flex-row items-center justify-between gap-4 transition-colors",
            theme === 'dark' ? "bg-[#1a1a1a] border-white/5" : "bg-white border-black/5"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              theme === 'dark' ? "bg-white/5" : "bg-black/5"
            )}>
              <Settings size={24} className={theme === 'dark' ? "text-blue-400" : "text-blue-600"} />
            </div>
            <div>
              <h3 className="font-black">Minimal Interface</h3>
              <p className={cn(
                "text-xs",
                theme === 'dark' ? "opacity-40" : "opacity-60"
              )}>Show more channels on a single page by reducing UI elements.</p>
            </div>
          </div>
          <button 
            onClick={onToggleLayout}
            className={cn(
              "px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
              stats.layoutMode === 'minimal'
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : (theme === 'dark' ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10")
            )}
          >
            {stats.layoutMode === 'minimal' ? 'Enabled' : 'Disabled'}
          </button>
        </motion.div>

        {/* System Actions */}
        <motion.div 
          variants={itemVariants}
          className={cn(
            "col-span-1 md:col-span-2 lg:col-span-4 rounded-[2.5rem] p-8 border flex flex-col md:flex-row gap-4 transition-colors",
            theme === 'dark' ? "bg-[#1a1a1a] border-white/5" : "bg-white border-black/5"
          )}
        >
          <button 
            onClick={() => window.location.reload()}
            className={cn(
              "flex-grow flex items-center justify-center gap-3 py-4 rounded-2xl transition-all border group",
              theme === 'dark' ? "bg-white/5 hover:bg-white/10 border-white/5" : "bg-black/5 hover:bg-black/10 border-black/5"
            )}
          >
            <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-xs font-black uppercase tracking-widest">Refresh Application</span>
          </button>
          
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to clear all data and cache? This will reset your progress and favorites.')) {
                localStorage.clear();
                if ('indexedDB' in window) {
                  indexedDB.deleteDatabase('keyval-store');
                }
                window.location.reload();
              }
            }}
            className={cn(
              "flex-grow flex items-center justify-center gap-3 py-4 rounded-2xl transition-all border group",
              theme === 'dark' ? "bg-red-500/5 hover:bg-red-500/10 text-red-500 border-red-500/10" : "bg-red-500/5 hover:bg-red-500/10 text-red-600 border-red-500/20"
            )}
          >
            <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Clear Cache & Reset Data</span>
          </button>
        </motion.div>
      </motion.div>

      <footer className={cn(
        "mt-16 pt-8 border-t flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] transition-colors",
        theme === 'dark' ? "border-white/5 opacity-30" : "border-black/5 opacity-50"
      )}>
        <div className="flex items-center gap-4">
          <Shield size={12} />
          <span>Privacy First: All data stays on your device</span>
        </div>
        <span>Freeview Play+ v2.0.0</span>
      </footer>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
