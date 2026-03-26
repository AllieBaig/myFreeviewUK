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
  category: string;
  theme: 'dark' | 'light';
}

export const ProgrammeGrid: React.FC<ProgrammeGridProps> = ({ 
  programmes, 
  onProgrammeSelect,
  onProgrammePlay,
  favorites,
  toggleFavorite,
  category,
  theme
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const getNowAndNext = (channelId: string) => {
    const channelProgrammes = programmes
      .filter(p => p.channelId === channelId)
      .filter(p => {
        if (category === 'Favorites') return favorites.includes(channelId);
        if (category === 'All') return true;
        if (category === 'TV Shows') return !['Movies', 'Sports', 'News'].includes(p.genre);
        return p.genre === category;
      })
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
    <div className={cn(
      "flex flex-col h-full overflow-hidden transition-colors",
      theme === 'dark' ? "bg-[#0a0a0a] text-white" : "bg-[#f5f5f5] text-black"
    )}>
      {/* Grid Content */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {CHANNELS.filter(channel => {
          if (category === 'Favorites') return favorites.includes(channel.id);
          if (category === 'All') return true;
          return programmes.some(p => {
            if (p.channelId !== channel.id) return false;
            if (category === 'TV Shows') return !['Movies', 'Sports', 'News'].includes(p.genre);
            return p.genre === category;
          });
        }).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
            <Star size={48} className="mb-4" />
            <p className="text-xl font-black uppercase tracking-widest">
              {category === 'Favorites' ? 'No Favorites Yet' : `No ${category} Found`}
            </p>
            <p className="text-xs mt-2">
              {category === 'Favorites' ? 'Add channels to your favorites to see them here' : 'Try a different category or check back later'}
            </p>
          </div>
        ) : CHANNELS.filter(channel => {
          if (category === 'Favorites') return favorites.includes(channel.id);
          if (category === 'All') return true;
          return programmes.some(p => {
            if (p.channelId !== channel.id) return false;
            if (category === 'TV Shows') return !['Movies', 'Sports', 'News'].includes(p.genre);
            return p.genre === category;
          });
        }).map(channel => {
          const { now, next } = getNowAndNext(channel.id);
          
          return (
            <div key={channel.id} className={cn(
              "flex flex-col border-b group transition-colors",
              theme === 'dark' ? "border-white/5" : "border-black/5"
            )}>
              {/* Row 1: Channel Info */}
              <div className={cn(
                "px-6 py-3 border-b flex items-center justify-between transition-colors",
                theme === 'dark' ? "bg-[#0d0d0d] border-white/5 group-hover:bg-[#111]" : "bg-white border-black/5 group-hover:bg-gray-50"
              )}>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "text-sm font-black w-6",
                    theme === 'dark' ? "opacity-20" : "opacity-40"
                  )}>{channel.number}</span>
                  <img 
                    src={channel.logo} 
                    alt={channel.name} 
                    className="h-6 object-contain brightness-90 group-hover:brightness-100 transition-all" 
                    referrerPolicy="no-referrer"
                  />
                  <span className={cn(
                    "text-[10px] font-bold tracking-widest uppercase",
                    theme === 'dark' ? "opacity-40" : "opacity-60"
                  )}>{channel.name}</span>
                </div>
                <button 
                  onClick={() => toggleFavorite(channel.id)}
                  className={cn(
                    "p-1.5 rounded-full transition-all hover:scale-110",
                    favorites.includes(channel.id) 
                      ? "text-yellow-500 bg-yellow-500/10" 
                      : (theme === 'dark' ? "text-white/10 hover:text-white/30" : "text-black/10 hover:text-black/30")
                  )}
                >
                  <Star size={14} fill={favorites.includes(channel.id) ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Row 2: Now Playing */}
              <div className={cn(
                "p-6 relative overflow-hidden flex flex-col border-b",
                theme === 'dark' ? "border-white/5" : "border-black/5"
              )}>
                {now ? (
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-grow pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 bg-red-600 text-[8px] font-black uppercase rounded animate-pulse text-white">Live</span>
                          <span className={cn(
                            "text-[10px] font-mono",
                            theme === 'dark' ? "opacity-40" : "opacity-60"
                          )}>{format(new Date(now.startTime), 'HH:mm')} - {format(new Date(now.endTime), 'HH:mm')}</span>
                        </div>
                        <h3 className={cn(
                          "text-xl font-black tracking-tight leading-tight transition-colors cursor-pointer",
                          theme === 'dark' ? "group-hover:text-blue-400" : "group-hover:text-blue-600"
                        )} onClick={() => onProgrammeSelect(now)}>
                          {now.title}
                        </h3>
                        <p className={cn(
                          "text-xs line-clamp-2 mt-2 max-w-2xl",
                          theme === 'dark' ? "opacity-40" : "opacity-60"
                        )}>{now.description}</p>
                      </div>
                      <button 
                        onClick={() => onProgrammePlay(now)}
                        className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 hover:scale-110 active:scale-95 transition-all shrink-0 text-white"
                      >
                        <Play size={24} fill="currentColor" />
                      </button>
                    </div>
                    
                    <div className="space-y-1 mt-4">
                      <div className={cn(
                        "flex justify-between text-[9px] font-mono uppercase tracking-tighter",
                        theme === 'dark' ? "opacity-40" : "opacity-60"
                      )}>
                        <span>{Math.round(calculateProgress(now))}% Complete</span>
                        <span>{now.genre}</span>
                      </div>
                      <div className={cn(
                        "w-full h-1 rounded-full overflow-hidden",
                        theme === 'dark' ? "bg-white/5" : "bg-black/5"
                      )}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${calculateProgress(now)}%` }}
                          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={cn("text-xs italic", theme === 'dark' ? "text-white/20" : "text-black/20")}>No current broadcast</div>
                )}
                
                {/* Dynamic Background Hint */}
                {now && (
                  <div className="absolute inset-0 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                    <img src={`https://picsum.photos/seed/${now.id}/1200/400`} className="w-full h-full object-cover grayscale" alt="" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              {/* Row 3: Next Up */}
              <div className={cn(
                "px-6 py-4 transition-colors cursor-pointer",
                theme === 'dark' ? "bg-white/[0.01] hover:bg-white/[0.03]" : "bg-black/[0.01] hover:bg-black/[0.03]"
              )} onClick={() => next && onProgrammeSelect(next)}>
                {next ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-grow">
                      <div className={cn(
                        "flex items-center gap-2 mb-1",
                        theme === 'dark' ? "opacity-40" : "opacity-60"
                      )}>
                        <Clock size={10} />
                        <span className="text-[9px] font-mono uppercase tracking-widest">Next at {format(new Date(next.startTime), 'HH:mm')}</span>
                      </div>
                      <h4 className={cn(
                        "font-bold text-sm transition-colors",
                        theme === 'dark' ? "group-hover:text-purple-400" : "group-hover:text-purple-600"
                      )}>{next.title}</h4>
                      <p className={cn(
                        "text-[10px] line-clamp-1 mt-0.5",
                        theme === 'dark' ? "opacity-30" : "opacity-50"
                      )}>{next.description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn(
                        "text-[8px] px-2 py-0.5 rounded border uppercase",
                        theme === 'dark' ? "bg-white/5 border-white/5 opacity-40" : "bg-black/5 border-black/5 opacity-60"
                      )}>{next.genre}</span>
                      <Info size={14} className={theme === 'dark' ? "opacity-20" : "opacity-40"} />
                    </div>
                  </div>
                ) : (
                  <div className={cn("text-[10px] italic", theme === 'dark' ? "text-white/10" : "text-black/10")}>Schedule ends</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
