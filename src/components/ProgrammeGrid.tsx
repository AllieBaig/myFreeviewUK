import React, { useState, useEffect, useRef } from 'react';
import { format, isWithinInterval, addHours, startOfHour, differenceInMinutes } from 'date-fns';
import { Programme, Channel, CHANNELS } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Info, Play, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProgrammeGridProps {
  programmes: Programme[];
  onProgrammeSelect: (p: Programme) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

export const ProgrammeGrid: React.FC<ProgrammeGridProps> = ({ 
  programmes, 
  onProgrammeSelect,
  favorites,
  toggleFavorite
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrollX, setScrollX] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const startTime = startOfHour(currentTime);
  const hours = Array.from({ length: 24 }, (_, i) => addHours(startTime, i));
  const pixelsPerMinute = 4; // 1 hour = 240px

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getProgrammeWidth = (p: Programme) => {
    const start = new Date(p.startTime);
    const end = new Date(p.endTime);
    return differenceInMinutes(end, start) * pixelsPerMinute;
  };

  const getProgrammeOffset = (p: Programme) => {
    const start = new Date(p.startTime);
    return Math.max(0, differenceInMinutes(start, startTime) * pixelsPerMinute);
  };

  const isLive = (p: Programme) => {
    return isWithinInterval(currentTime, {
      start: new Date(p.startTime),
      end: new Date(p.endTime)
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white overflow-hidden">
      {/* Time Header */}
      <div className="flex border-b border-white/10 bg-[#111] sticky top-0 z-20">
        <div className="w-32 flex-shrink-0 border-r border-white/10 p-4 font-bold text-xs uppercase tracking-widest opacity-50">
          Channels
        </div>
        <div className="flex overflow-hidden relative flex-grow">
          <div 
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${scrollX}px)` }}
          >
            {hours.map((hour, i) => (
              <div key={i} className="w-[240px] flex-shrink-0 p-4 text-xs font-mono opacity-50 border-r border-white/5">
                {format(hour, 'HH:mm')}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {CHANNELS.map(channel => (
          <div key={channel.id} className="flex border-b border-white/5 group">
            {/* Channel Info */}
            <div className="w-32 flex-shrink-0 border-r border-white/10 p-4 bg-[#111] sticky left-0 z-10 flex flex-col items-center justify-center gap-2">
              <img src={channel.logo} alt={channel.name} className="h-8 object-contain brightness-90 group-hover:brightness-100 transition-all" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold opacity-40">{channel.number}</span>
                <button 
                  onClick={() => toggleFavorite(channel.id)}
                  className={cn(
                    "p-1 rounded-full transition-colors",
                    favorites.includes(channel.id) ? "text-yellow-500" : "text-white/20 hover:text-white/40"
                  )}
                >
                  <Star size={12} fill={favorites.includes(channel.id) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* Programmes Row */}
            <div className="flex-grow relative h-24 overflow-hidden">
              <div 
                className="absolute top-0 left-0 flex h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${scrollX}px)` }}
              >
                {programmes
                  .filter(p => p.channelId === channel.id)
                  .map(p => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      onClick={() => onProgrammeSelect(p)}
                      className={cn(
                        "absolute top-0 h-full border-r border-white/5 p-3 cursor-pointer transition-all overflow-hidden",
                        isLive(p) && "bg-blue-500/10 border-l-2 border-l-blue-500"
                      )}
                      style={{ 
                        width: getProgrammeWidth(p),
                        left: getProgrammeOffset(p)
                      }}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm truncate">{p.title}</h3>
                          {isLive(p) && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 bg-red-600 text-[8px] font-black uppercase rounded animate-pulse">
                              Live
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] opacity-50 line-clamp-2 mt-1">{p.description}</p>
                        <div className="mt-auto flex items-center justify-between text-[9px] font-mono opacity-40">
                          <span>{format(new Date(p.startTime), 'HH:mm')} - {format(new Date(p.endTime), 'HH:mm')}</span>
                          <span className="uppercase tracking-tighter">{p.genre}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 right-8 flex gap-4 z-30">
        <button 
          onClick={() => setScrollX(Math.max(0, scrollX - 480))}
          className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full border border-white/10 transition-all active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={() => setScrollX(scrollX + 480)}
          className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full border border-white/10 transition-all active:scale-95"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Current Time Indicator */}
      <div 
        className="absolute top-0 bottom-0 w-px bg-blue-500 z-20 pointer-events-none"
        style={{ 
          left: `calc(128px + ${differenceInMinutes(currentTime, startTime) * pixelsPerMinute}px - ${scrollX}px)` 
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
      </div>
    </div>
  );
};
