import React from 'react';
import { UserStats, CHANNELS } from '../types';
import { motion } from 'motion/react';
import { Trophy, Flame, Star, Zap, Clock, Shield, HardDrive, WifiOff } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileViewProps {
  stats: UserStats;
  favorites: string[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ stats, favorites }) => {
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
        <p className="text-white/40 font-mono text-sm uppercase tracking-widest">Local Viewer ID: {stats.uid}</p>
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
          className="col-span-1 md:col-span-2 row-span-2 bg-gradient-to-br from-blue-600 to-purple-700 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-2xl shadow-blue-500/20"
        >
          <div>
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mb-6 border border-white/30">
              <Zap size={40} className="text-white" />
            </div>
            <h2 className="text-4xl font-black mb-2">Level {stats.level}</h2>
            <p className="text-white/70 text-lg">You're in the top 5% of viewers this week!</p>
          </div>
          <div className="mt-12">
            <div className="flex justify-between items-end mb-4">
              <span className="text-sm font-bold uppercase tracking-widest opacity-80">Progress to Level {stats.level + 1}</span>
              <span className="text-2xl font-black">{stats.xp % 1000} <span className="text-sm opacity-60">/ 1000 XP</span></span>
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
          className="bg-[#1a1a1a] rounded-[2.5rem] p-8 border border-white/5 flex flex-col items-center justify-center text-center group hover:border-orange-500/30 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Flame size={32} className="text-orange-500" />
          </div>
          <span className="text-4xl font-black text-orange-500">{stats.streak}</span>
          <span className="text-xs font-bold uppercase tracking-widest opacity-40 mt-1">Day Streak</span>
        </motion.div>

        {/* Offline Status Block */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#1a1a1a] rounded-[2.5rem] p-8 border border-white/5 flex flex-col items-center justify-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <WifiOff size={32} className="text-green-500" />
          </div>
          <span className="text-xl font-black text-green-500">PWA Ready</span>
          <span className="text-[10px] font-mono opacity-40 mt-1 uppercase">Offline Support Active</span>
        </motion.div>

        {/* Achievements Block */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 md:col-span-2 bg-[#1a1a1a] rounded-[2.5rem] p-8 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Trophy size={24} className="text-yellow-500" />
              Achievements
            </h3>
            <span className="text-xs font-mono opacity-40">{stats.achievements.length} Unlocked</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {stats.achievements.map((achievement, i) => (
              <div key={i} className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/10 transition-colors cursor-default">
                {achievement}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Favorites Block */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 md:col-span-2 bg-[#1a1a1a] rounded-[2.5rem] p-8 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Star size={24} className="text-blue-500" />
              Favorite Channels
            </h3>
            <span className="text-xs font-mono opacity-40">{favorites.length} Saved</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {favoriteChannelData.map(channel => (
              <div key={channel.id} className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center p-4 border border-white/5 hover:border-white/20 transition-all group">
                <img src={channel.logo} alt={channel.name} className="max-h-full object-contain brightness-75 group-hover:brightness-100 transition-all" />
              </div>
            ))}
            {favorites.length === 0 && (
              <div className="col-span-4 py-8 text-center text-sm opacity-30 italic">
                No favorites added yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Storage Info Block */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#1a1a1a] rounded-[2.5rem] p-8 border border-white/5 flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 opacity-40 mb-4">
            <HardDrive size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Local Storage</span>
          </div>
          <div>
            <span className="text-2xl font-black">1.2 MB</span>
            <p className="text-[10px] opacity-40 mt-1">EPG Cache & Preferences</p>
          </div>
        </motion.div>

        {/* Last Sync Block */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#1a1a1a] rounded-[2.5rem] p-8 border border-white/5 flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 opacity-40 mb-4">
            <Clock size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Last Update</span>
          </div>
          <div>
            <span className="text-xl font-black">{format(new Date(stats.lastCheckIn), 'HH:mm')}</span>
            <p className="text-[10px] opacity-40 mt-1">{format(new Date(stats.lastCheckIn), 'MMM dd, yyyy')}</p>
          </div>
        </motion.div>
      </motion.div>

      <footer className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between opacity-30 text-[10px] font-mono uppercase tracking-[0.2em]">
        <div className="flex items-center gap-4">
          <Shield size={12} />
          <span>Privacy First: All data stays on your device</span>
        </div>
        <span>Freeview Play+ v2.0.0</span>
      </footer>
    </div>
  );
};
