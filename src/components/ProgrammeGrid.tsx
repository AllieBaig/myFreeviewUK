import React, { useState, useEffect, useRef } from 'react';
import { format, isWithinInterval, addHours, startOfHour, differenceInMinutes } from 'date-fns';
import { Programme, Channel, CHANNELS } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Info, Play, Trophy, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProgrammeGridProps {
  programmes: Programme[];
  onProgrammeSelect: (p: Programme) => void;
  onProgrammePlay: (p: Programme) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

export const ProgrammeGrid: React.FC<ProgrammeGridProps> = ({ 
  programmes, 
  onProgrammeSelect,
  onProgrammePlay,
  favorites,
  toggleFavorite
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const getNowAndNext = (channelId: string) => {
    const channelProgrammes = programmes
      .filter(p => p.channelId === channelId)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const now = channelProgrammes.find(p => 
      isWithinInterval(currentTime, {
        start: new Date(p.startTime),
        end: new Date(p.endTime)
      })
    );

    const next = now 
      ? channelProgrammes.find(p => new Date(p.startTime) >= new Date(now.endTime))
      : channelProgrammes.find(p => new Date(p.startTime) > currentTime);

    return { now, next };
  };

  const calculateProgress = (p: Programme) => {
    const start = new Date(p.startTime).getTime();
    const end = new Date(p.endTime).getTime();
    const now = currentTime.getTime();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[200px_1fr_1fr] border-b border-white/10 bg-[#111] sticky top-0 z-20 font-mono text-[10px] uppercase tracking-[0.2em] opacity-40">
        <div className="p-4 border-r border-white/10">Channel</div>
        <div className="p-4 border-r border-white/10">Now Playing</div>
        <div className="p-4">Next Up</div>
      </div>

      {/* Grid Content */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {CHANNELS.map(channel => {
          const { now, next } = getNowAndNext(channel.id);
          
          return (
            <div key={channel.id} className="grid grid-cols-[200px_1fr_1fr] border-b border-white/5 group hover:bg-white/[0.02] transition-colors min-h-[140px]">
              {/* Column 1: Channel Info */}
              <div className="p-6 border-r border-white/10 flex flex-col items-center justify-center gap-4 bg-[#0d0d0d] group-hover:bg-[#111] transition-colors">
                <div className="relative">
                  <img src={channel.logo} alt={channel.name} className="h-10 object-contain brightness-90 group-hover:brightness-100 transition-all" />
                  <div className="absolute -top-4 -left-4 text-[10px] font-black opacity-20">{channel.number}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">{channel.name}</span>
                  <button 
                    onClick={() => toggleFavorite(channel.id)}
                    className={cn(
                      "p-1.5 rounded-full transition-all hover:scale-110",
                      favorites.includes(channel.id) ? "text-yellow-500 bg-yellow-500/10" : "text-white/10 hover:text-white/30"
                    )}
                  >
                    <Star size={14} fill={favorites.includes(channel.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              {/* Column 2: Now Playing */}
              <div className="p-6 border-r border-white/10 relative overflow-hidden flex flex-col justify-center">
                {now ? (
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 bg-red-600 text-[8px] font-black uppercase rounded animate-pulse">Live</span>
                          <span className="text-[10px] font-mono opacity-40">{format(new Date(now.startTime), 'HH:mm')} - {format(new Date(now.endTime), 'HH:mm')}</span>
                        </div>
                        <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => onProgrammeSelect(now)}>
                          {now.title}
                        </h3>
                      </div>
                      <button 
                        onClick={() => onProgrammePlay(now)}
                        className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 hover:scale-110 active:scale-95 transition-all"
                      >
                        <Play size={20} fill="currentColor" />
                      </button>
                    </div>
                    
                    <p className="text-xs opacity-40 line-clamp-2 mb-4 max-w-md">{now.description}</p>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono opacity-40 uppercase tracking-tighter">
                        <span>{Math.round(calculateProgress(now))}% Complete</span>
                        <span>{now.genre}</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${calculateProgress(now)}%` }}
                          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-white/20 text-xs italic">No current broadcast</div>
                )}
                
                {/* Dynamic Background Hint */}
                {now && (
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity">
                    <img src={`https://picsum.photos/seed/${now.id}/800/400`} className="w-full h-full object-cover grayscale" alt="" />
                  </div>
                )}
              </div>

              {/* Column 3: Next Up */}
              <div className="p-6 flex flex-col justify-center bg-white/[0.01]">
                {next ? (
                  <div className="group/next cursor-pointer" onClick={() => onProgrammeSelect(next)}>
                    <div className="flex items-center gap-2 mb-2 opacity-40">
                      <Clock size={12} />
                      <span className="text-[10px] font-mono uppercase tracking-widest">Next at {format(new Date(next.startTime), 'HH:mm')}</span>
                    </div>
                    <h4 className="font-bold text-sm group-hover/next:text-purple-400 transition-colors">{next.title}</h4>
                    <p className="text-[10px] opacity-30 line-clamp-2 mt-1">{next.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[9px] px-2 py-0.5 bg-white/5 rounded border border-white/5 opacity-40 uppercase">{next.genre}</span>
                      <Info size={12} className="opacity-0 group-hover/next:opacity-40 transition-opacity" />
                    </div>
                  </div>
                ) : (
                  <div className="text-white/10 text-xs italic">Schedule ends</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
