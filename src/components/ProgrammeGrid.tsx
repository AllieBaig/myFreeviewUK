import React, { useState, useEffect, useRef, useMemo } from 'react';
import { format, isWithinInterval, addHours, startOfHour, differenceInMinutes, addMinutes, isAfter, isBefore } from 'date-fns';
import { Programme, Channel, CHANNELS } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Info, Play, Trophy, Clock, Tv, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProgrammeGridProps {
  programmes: Programme[];
  onProgrammeSelect: (p: Programme) => void;
  onProgrammePlay: (p: Programme) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  category: string;
  theme: 'dark' | 'light';
  layoutMode: 'standard' | 'minimal';
}

const HOUR_WIDTH = 400; // pixels per hour
const MINUTE_WIDTH = HOUR_WIDTH / 60;
const CHANNEL_COL_WIDTH = 160;
const MINIMAL_CHANNEL_COL_WIDTH = 100;

export const ProgrammeGrid: React.FC<ProgrammeGridProps> = ({ 
  programmes, 
  onProgrammeSelect,
  onProgrammePlay,
  favorites,
  toggleFavorite,
  category,
  theme,
  layoutMode
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Start the grid from the beginning of today or the current hour
  const gridStartTime = useMemo(() => startOfHour(new Date()), []);
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      slots.push(addHours(gridStartTime, i));
    }
    return slots;
  }, [gridStartTime]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const diffMinutes = differenceInMinutes(now, gridStartTime);
      if (diffMinutes > 0) {
        scrollContainerRef.current.scrollLeft = diffMinutes * MINUTE_WIDTH - 100;
      }
    }
  }, [gridStartTime]);

  const filteredChannels = useMemo(() => {
    return CHANNELS.filter(channel => {
      if (category === 'Favorites') return favorites.includes(channel.id);
      if (category === 'All') return true;
      
      return programmes.some(p => {
        if (p.channelId !== channel.id) return false;
        // Check if the program is currently playing or in the future
        const isCurrentOrFuture = isAfter(new Date(p.endTime), currentTime);
        if (!isCurrentOrFuture) return false;

        if (category === 'TV Shows') return !['Movies', 'Sports', 'News'].includes(p.genre);
        return p.genre === category;
      });
    });
  }, [category, favorites, programmes, currentTime]);

  const getProgrammeStyle = (p: Programme) => {
    const start = new Date(p.startTime);
    const end = new Date(p.endTime);
    const diffStart = differenceInMinutes(start, gridStartTime);
    const duration = differenceInMinutes(end, start);
    
    return {
      left: `${diffStart * MINUTE_WIDTH}px`,
      width: `${duration * MINUTE_WIDTH - 2}px`, // -2 for gap
    };
  };

  const isCurrentProgramme = (p: Programme) => {
    return isWithinInterval(currentTime, {
      start: new Date(p.startTime),
      end: new Date(p.endTime)
    });
  };

  const isMinimal = layoutMode === 'minimal';
  const channelWidth = isMinimal ? MINIMAL_CHANNEL_COL_WIDTH : CHANNEL_COL_WIDTH;

  const scrollToTime = (time: Date) => {
    if (scrollContainerRef.current) {
      const diffMinutes = differenceInMinutes(time, gridStartTime);
      scrollContainerRef.current.scrollTo({
        left: diffMinutes * MINUTE_WIDTH,
        behavior: 'smooth'
      });
    }
  };

  const timePresets = [
    { label: 'Now', time: new Date() },
    { label: 'Morning', time: addHours(startOfHour(new Date()), 8) },
    { label: 'Afternoon', time: addHours(startOfHour(new Date()), 14) },
    { label: 'Evening', time: addHours(startOfHour(new Date()), 19) },
    { label: 'Tonight', time: addHours(startOfHour(new Date()), 22) },
  ];

  const getNowProgramme = (channelId: string) => {
    return programmes.find(p => 
      p.channelId === channelId && 
      isWithinInterval(currentTime, {
        start: new Date(p.startTime),
        end: new Date(p.endTime)
      })
    );
  };

  const channelGroups = useMemo(() => {
    if (category !== 'All') {
      return [{ title: category, channels: filteredChannels }];
    }

    const groups = [
      { title: "Dynamic Channels", icon: <Tv size={14} />, channels: filteredChannels }
    ];

    const genres = ['Movies', 'TV Shows', 'Sports', 'News', 'Reality', 'Drama', 'Documentary'];
    genres.forEach(genre => {
      const genreChannels = filteredChannels.filter(channel => {
        const now = getNowProgramme(channel.id);
        if (now) {
          if (genre === 'TV Shows') return !['Movies', 'Sports', 'News'].includes(now.genre);
          return now.genre === genre;
        }
        return false;
      });

      if (genreChannels.length > 0) {
        groups.push({ title: genre, icon: <Trophy size={14} />, channels: genreChannels });
      }
    });

    return groups;
  }, [category, filteredChannels, programmes, currentTime]);

  const renderGroupHeader = (title: string, icon?: React.ReactNode, isSticky: boolean = false) => (
    <div className={cn(
      "flex items-center gap-3 px-4 transition-colors sticky left-0 z-20",
      theme === 'dark' ? "bg-[#1a1a1a] text-white/40" : "bg-gray-100 text-black/40",
      isMinimal ? "h-8" : "h-10",
      !isSticky && "w-full"
    )}>
      {icon}
      <h2 className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{title}</h2>
      {!isSticky && <div className={cn("flex-grow h-[1px] ml-2", theme === 'dark' ? "bg-white/5" : "bg-black/5")} />}
    </div>
  );

  return (
    <div className={cn(
      "flex flex-col h-full overflow-hidden transition-colors relative",
      theme === 'dark' ? "bg-[#0a0a0a] text-white" : "bg-[#f5f5f5] text-black"
    )}>
      {/* Time Navigation Bar */}
      <div className={cn(
        "flex items-center gap-2 px-4 py-2 border-b overflow-x-auto no-scrollbar",
        theme === 'dark' ? "bg-[#111] border-white/5" : "bg-white border-black/5"
      )}>
        {timePresets.map((preset, i) => (
          <button
            key={i}
            onClick={() => scrollToTime(preset.time)}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              theme === 'dark' 
                ? "bg-white/5 hover:bg-white/10 text-white/40 hover:text-white" 
                : "bg-black/5 hover:bg-black/10 text-black/40 hover:text-black"
            )}
          >
            {preset.label}
          </button>
        ))}
        <div className="flex-grow" />
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono",
          theme === 'dark' ? "bg-white/5 text-white/40" : "bg-black/5 text-black/40"
        )}>
          <Clock size={10} />
          {format(currentTime, 'HH:mm:ss')}
        </div>
      </div>

      {/* Timeline Header */}
      <div className="flex border-b border-white/5 relative z-40">
        <div 
          style={{ width: channelWidth }} 
          className={cn(
            "shrink-0 border-r flex items-center justify-center font-black uppercase tracking-widest text-[10px] transition-colors",
            theme === 'dark' ? "bg-[#111] border-white/10 text-white/40" : "bg-white border-black/5 text-black/40"
          )}
        >
          Channels
        </div>
        <div className="flex-grow overflow-hidden">
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto no-scrollbar"
            onScroll={(e) => {
              const content = document.getElementById('grid-content');
              if (content) content.scrollLeft = (e.target as HTMLDivElement).scrollLeft;
            }}
          >
            <div className="flex relative" style={{ width: 24 * HOUR_WIDTH }}>
              {timeSlots.map((time, i) => (
                <div 
                  key={i} 
                  style={{ width: HOUR_WIDTH }}
                  className={cn(
                    "shrink-0 border-r px-4 py-3 text-[10px] font-mono transition-colors",
                    theme === 'dark' ? "border-white/5 text-white/40" : "border-black/5 text-black/40"
                  )}
                >
                  {format(time, 'HH:mm')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-grow flex overflow-hidden">
        {/* Sticky Channel Column */}
        <div 
          style={{ width: channelWidth }}
          className={cn(
            "shrink-0 border-r overflow-y-auto no-scrollbar z-30 transition-colors",
            theme === 'dark' ? "bg-[#0d0d0d] border-white/10" : "bg-white border-black/5"
          )}
          onScroll={(e) => {
            const content = document.getElementById('grid-content');
            if (content) content.scrollTop = (e.target as HTMLDivElement).scrollTop;
          }}
        >
          {channelGroups.map(group => (
            <React.Fragment key={group.title}>
              {category === 'All' && renderGroupHeader(group.title, group.icon, true)}
              {group.channels.map(channel => (
                <div 
                  key={channel.id} 
                  className={cn(
                    "border-b flex items-center gap-3 px-4 transition-all",
                    theme === 'dark' ? "border-white/5" : "border-black/5",
                    isMinimal ? "h-12" : "h-20"
                  )}
                >
                  <span className={cn(
                    "font-black opacity-20",
                    isMinimal ? "text-[8px] w-4" : "text-[10px] w-6"
                  )}>{channel.number}</span>
                  <img 
                    src={channel.logo} 
                    alt={channel.name} 
                    className={cn("object-contain", isMinimal ? "h-4 w-8" : "h-6 w-12")}
                    referrerPolicy="no-referrer"
                  />
                  {!isMinimal && (
                    <span className="text-[9px] font-bold uppercase tracking-tighter truncate opacity-60">
                      {channel.name}
                    </span>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* Timeline Content */}
        <div 
          id="grid-content"
          className="flex-grow overflow-auto custom-scrollbar relative"
          onScroll={(e) => {
            const header = scrollContainerRef.current;
            if (header) header.scrollLeft = (e.target as HTMLDivElement).scrollLeft;
            const channels = (e.target as HTMLDivElement).previousSibling as HTMLDivElement;
            if (channels) channels.scrollTop = (e.target as HTMLDivElement).scrollTop;
          }}
        >
          <div className="relative" style={{ width: 24 * HOUR_WIDTH }}>
            {/* Current Time Indicator */}
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-red-600 z-10 pointer-events-none"
              style={{ 
                left: `${differenceInMinutes(currentTime, gridStartTime) * MINUTE_WIDTH}px`,
                boxShadow: '0 0 10px rgba(220, 38, 38, 0.5)'
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-red-600 text-[8px] font-black text-white px-1 rounded">
                NOW
              </div>
            </div>

            {channelGroups.map(group => (
              <React.Fragment key={group.title}>
                {category === 'All' && renderGroupHeader(group.title, group.icon)}
                {group.channels.map(channel => (
                  <div 
                    key={channel.id} 
                    className={cn(
                      "relative border-b transition-colors",
                      theme === 'dark' ? "border-white/5" : "border-black/5",
                      isMinimal ? "h-12" : "h-20"
                    )}
                  >
                    {programmes
                      .filter(p => p.channelId === channel.id)
                      .map(p => {
                        const isLive = isCurrentProgramme(p);
                        const isPast = isBefore(new Date(p.endTime), currentTime);
                        
                        return (
                          <motion.div
                            key={p.id}
                            style={getProgrammeStyle(p)}
                            className={cn(
                              "absolute top-1 bottom-1 rounded-lg p-3 cursor-pointer transition-all overflow-hidden group border",
                              isLive 
                                ? (theme === 'dark' ? "bg-blue-600/20 border-blue-600/40" : "bg-blue-50 border-blue-200")
                                : (theme === 'dark' ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-white border-black/5 hover:bg-gray-50"),
                              isPast && "opacity-40 grayscale-[0.5]",
                              isMinimal && "p-1.5 rounded-md"
                            )}
                            onClick={() => onProgrammeSelect(p)}
                          >
                            <div className="flex flex-col h-full justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  {isLive && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                  )}
                                  <span className={cn(
                                    "font-mono opacity-40",
                                    isMinimal ? "text-[7px]" : "text-[9px]"
                                  )}>
                                    {format(new Date(p.startTime), 'HH:mm')}
                                  </span>
                                </div>
                                <h4 className={cn(
                                  "font-black tracking-tight line-clamp-1 leading-tight",
                                  isMinimal ? "text-[10px]" : "text-xs",
                                  isLive && (theme === 'dark' ? "text-blue-400" : "text-blue-600")
                                )}>
                                  {p.title}
                                </h4>
                              </div>
                              
                              {!isMinimal && (
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-[8px] uppercase tracking-widest opacity-30 font-bold">
                                    {p.genre}
                                  </span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onProgrammePlay(p);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-blue-600 rounded-full text-white"
                                  >
                                    <Play size={10} fill="currentColor" />
                                  </button>
                                </div>
                              )}

                              {isLive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600/20">
                                  <motion.div 
                                    className="h-full bg-blue-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${differenceInMinutes(currentTime, new Date(p.startTime)) / differenceInMinutes(new Date(p.endTime), new Date(p.startTime)) * 100}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredChannels.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
          <Calendar size={48} className="mb-4" />
          <p className="text-xl font-black uppercase tracking-widest">No Channels Found</p>
          <p className="text-xs mt-2">Try a different category or check your favorites</p>
        </div>
      )}
    </div>
  );
};
