import React from 'react';
import { Trophy, Star, Zap, Flame, User, RefreshCw } from 'lucide-react';
import { UserStats } from '../types';
import { motion } from 'motion/react';

interface GamificationHeaderProps {
  stats: UserStats;
  onProfileClick: () => void;
  onRefresh: () => void;
}

export const GamificationHeader: React.FC<GamificationHeaderProps> = ({ stats, onProfileClick, onRefresh }) => {
  const xpToNextLevel = stats.level * 1000;
  const progress = (stats.xp % 1000) / 10;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#111] border-b border-white/10">
      <div className="flex items-center gap-6">
        <button 
          onClick={onProfileClick}
          className="flex items-center gap-3 group text-left transition-all hover:opacity-80"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white/20 shadow-lg group-hover:scale-105 transition-transform">
              <User size={24} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center border-2 border-[#111] text-[10px] font-black text-black">
              {stats.level}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">Viewer Level {stats.level}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
              <span className="text-[10px] font-mono opacity-40">{stats.xp % 1000} / 1000 XP</span>
            </div>
          </div>
        </button>

        <div className="h-8 w-px bg-white/10" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/20">
            <Flame size={14} className="text-orange-500" />
            <span className="text-xs font-bold text-orange-500">{stats.streak} Day Streak</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">
            <Trophy size={14} className="text-yellow-500" />
            <span className="text-xs font-bold text-yellow-500">{stats.achievements.length} Badges</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onRefresh}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all text-white/40 hover:text-white"
          title="Refresh Schedule"
        >
          <RefreshCw size={14} />
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all text-xs font-bold">
          <Star size={14} className="text-yellow-500" />
          Quests
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all text-xs font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)]">
          <Zap size={14} />
          Boost XP
        </button>
      </div>
    </div>
  );
};
