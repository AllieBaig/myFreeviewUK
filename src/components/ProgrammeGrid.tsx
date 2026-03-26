import React, { useState, useEffect, useRef } from 'react';
import { format, isWithinInterval, addHours, startOfHour, differenceInMinutes, addMinutes } from 'date-fns';
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

const HOUR_WIDTH = 400; // Pixels per hour
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
  const [startTime] = useState(startOfHour(new Date()));
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const minutesSinceStart = differenceInMinutes(new Date(), startTime);
      const scrollPos = (minutesSinceStart / 60) * HOUR_WIDTH - 100;
      scrollContainerRef.current.scrollLeft = Math.max(0, scrollPos);
    }
  }, [startTime]);

  const getChannelProgrammes = (channelId: string) => {
    return programmes
      .filter(p => p.channelId === channelId)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const getNowAndNext = (channelId: string) => {
    const channelProgrammes = getChannelProgrammes(channelId);
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

  const calculateWidth = (start: string, end: string) => {
    const duration = differenceInMinutes(new Date(end), new Date(start));
    return (duration / 60) * HOUR_WIDTH;
  };

  const calculateLeft = (start: string) => {
    const offset = differenceInMinutes(new Date(start), startTime);
    return (offset / 60) * HOUR_WIDTH;
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => addHours(startTime, i));

  const isMinimal = layoutMode === 'minimal';
  const channelWidth = isMinimal ? MINIMAL_CHANNEL_COL_WIDTH : CHANNEL_COL_WIDTH;

  const filteredChannels = CHANNELS.filter(channel => {
    if (category === 'Favorites') return favorites.includes(channel.id);
    if (category === 'All') return true;
    
    const { now } = getNowAndNext(channel.id);
    if (now) {
      if (category === 'TV Shows') return !['Movies', 'Sports', 'News'].includes(now.genre);
      if (now.genre === category) return true;
    }

    return programmes.some(p => {
      if (p.channelId !== channel.id) return false;
      if (category === 'TV Shows') return !['Movies', 'Sports', 'News'].includes(p.genre);
      return p.genre === category;
    });
  });

  const renderChannelRow = (channel: Channel, groupKey: string) => (
    <div 
      key={`${groupKey}-${channel.id}`}
      style={{ height: isMinimal ? 60 : 100 }}
      className={cn(
        "relative border-b transition-colors",
        theme === 'dark' ? "border-white/5" : "border-black/5"
      )}
    >
      {getChannelProgrammes(channel.id).map(p => {
        const width = calculateWidth(p.startTime, p.endTime);
        const left = calculateLeft(p.startTime);
        const isLive = isWithinInterval(currentTime, {
          start: new Date(p.startTime),
          end: new Date(p.endTime)
        });

        return (
          <motion.div
            key={p.id}
            onClick={() => onProgrammeSelect(p)}
            style={{ 
              width: width - 2, 
              left: left + 1,
              height: 'calc(100% - 8px)',
              top: 4
            }}
            className={cn(
              "absolute rounded-xl p-3 cursor-pointer transition-all group overflow-hidden",
              isLive 
                ? (theme === 'dark' ? "bg-blue-600/20 border border-blue-600/40" : "bg-blue-600/10 border border-blue-600/20")
                : (theme === 'dark' ? "bg-white/5 border border-white/5 hover:bg-white/10" : "bg-black/5 border border-black/5 hover:bg-black/10")
            )}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <h4 className={cn(
                  "font-black tracking-tight leading-tight line-clamp-1",
                  isMinimal ? "text-[10px]" : "text-xs",
                  isLive && (theme === 'dark' ? "text-blue-400" : "text-blue-600")
                )}>
                  {p.title}
                </h4>
                <span className="text-[8px] font-mono opacity-40">
                  {format(new Date(p.startTime), 'HH:mm')}
                </span>
              </div>
              {isLive && !isMinimal && (
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${Math.min(100, Math.max(0, (differenceInMinutes(currentTime, new Date(p.startTime)) / differenceInMinutes(new Date(p.endTime), new Date(p.startTime))) * 100))}%` }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const renderChannelLabel = (channel: Channel, groupKey: string) => (
    <div 
      key={`${groupKey}-${channel.id}`}
      style={{ height: isMinimal ? 60 : 100 }}
      className={cn(
        "shrink-0 flex flex-col items-center justify-center gap-2 border-b transition-colors",
        theme === 'dark' ? "border-white/5 hover:bg-white/5" : "border-black/5 hover:bg-black/5"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black opacity-20">{channel.number}</span>
        <img 
          src={channel.logo} 
          alt="" 
          className={isMinimal ? "h-4 object-contain" : "h-6 object-contain"}
          referrerPolicy="no-referrer"
        />
      </div>
      {!isMinimal && (
        <span className="text-[9px] font-black uppercase tracking-widest opacity-40 truncate px-2 w-full text-center">
          {channel.name}
        </span>
      )}
    </div>
  );

  const renderGroupHeader = (title: string, icon: React.ReactNode) => (
    <div className={cn(
      "h-12 flex items-center gap-3 px-4 border-b sticky top-0 z-30 transition-colors",
      theme === 'dark' ? "bg-[#1a1a1a] border-white/10 text-white/60" : "bg-gray-100 border-black/10 text-black/60"
    )}>
      {icon}
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</span>
    </div>
  );

  const genres = ['Movies', 'TV Shows', 'Sports', 'News', 'Reality', 'Drama', 'Documentary'];

  return (
    <div className={cn(
      "flex flex-col h-full overflow-hidden transition-colors relative",
      theme === 'dark' ? "bg-[#0a0a0a] text-white" : "bg-[#f5f5f5] text-black"
    )}>
      {/* Time Header */}
      <div className="flex border-b border-white/5 relative z-40 shadow-lg">
        <div style={{ width: channelWidth }} className={cn(
          "shrink-0 border-r flex items-center justify-center transition-all relative overflow-hidden",
          theme === 'dark' ? "bg-[#111] border-white/5" : "bg-white border-black/5"
        )}>
          <button 
            onClick={() => {
              if (scrollContainerRef.current) {
                const minutesSinceStart = differenceInMinutes(new Date(), startTime);
                const scrollPos = (minutesSinceStart / 60) * HOUR_WIDTH - 100;
                scrollContainerRef.current.scrollTo({ left: Math.max(0, scrollPos), behavior: 'smooth' });
              }
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95",
              theme === 'dark' ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]" : "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.2)]"
            )}
          >
            <Clock size={10} />
            Now
          </button>
        </div>
        <div 
          className="flex overflow-hidden no-scrollbar"
          style={{ width: `calc(100% - ${channelWidth}px)` }}
        >
          <div className="flex relative" style={{ width: 24 * HOUR_WIDTH }}>
            {timeSlots.map((time, i) => (
              <div 
                key={i} 
                style={{ width: HOUR_WIDTH }}
                className={cn(
                  "shrink-0 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r transition-colors",
                  theme === 'dark' ? "border-white/5 text-white/40" : "border-black/5 text-black/40"
                )}
              >
                {format(time, 'HH:mm')}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex flex-grow overflow-hidden">
        {/* Fixed Channel Column */}
        <div 
          style={{ width: channelWidth }}
          className={cn(
            "flex flex-col overflow-y-auto no-scrollbar border-r transition-all z-20 shadow-xl",
            theme === 'dark' ? "bg-[#0d0d0d] border-white/5" : "bg-white border-black/5"
          )}
        >
          {category === 'All' ? (
            <>
              {renderGroupHeader("Dynamic Channels", <Tv size={12} />)}
              {CHANNELS.map(channel => renderChannelLabel(channel, 'dynamic'))}
              
              {renderGroupHeader("Explore by Category", <Trophy size={12} />)}
              {genres.map(genre => {
                const genreChannels = CHANNELS.filter(channel => {
                  const { now } = getNowAndNext(channel.id);
                  if (now) {
                    if (genre === 'TV Shows') return !['Movies', 'Sports', 'News'].includes(now.genre);
                    return now.genre === genre;
                  }
                  return false;
                });
                if (genreChannels.length === 0) return null;
                return (
                  <React.Fragment key={genre}>
                    <div className={cn(
                      "h-8 flex items-center px-4 border-b text-[8px] font-black uppercase tracking-widest opacity-40",
                      theme === 'dark' ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"
                    )}>
                      {genre}
                    </div>
                    {genreChannels.map(channel => renderChannelLabel(channel, `genre-${genre}`))}
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            filteredChannels.map(channel => renderChannelLabel(channel, 'filtered'))
          )}
        </div>

        {/* Scrollable Timeline */}
        <div 
          ref={scrollContainerRef}
          className="flex-grow overflow-auto custom-scrollbar relative z-10"
        >
          <div className="relative" style={{ width: 24 * HOUR_WIDTH }}>
            {/* Now Line */}
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-red-600 z-40 pointer-events-none"
              style={{ left: (differenceInMinutes(currentTime, startTime) / 60) * HOUR_WIDTH }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            </div>

            {/* Grid Rows */}
            {category === 'All' ? (
              <>
                <div className="h-12 border-b" /> {/* Spacer for header */}
                {CHANNELS.map(channel => renderChannelRow(channel, 'dynamic'))}
                
                <div className="h-12 border-b" /> {/* Spacer for header */}
                {genres.map(genre => {
                  const genreChannels = CHANNELS.filter(channel => {
                    const { now } = getNowAndNext(channel.id);
                    if (now) {
                      if (genre === 'TV Shows') return !['Movies', 'Sports', 'News'].includes(now.genre);
                      return now.genre === genre;
                    }
                    return false;
                  });
                  if (genreChannels.length === 0) return null;
                  return (
                    <React.Fragment key={genre}>
                      <div className="h-8 border-b" /> {/* Spacer for genre subheader */}
                      {genreChannels.map(channel => renderChannelRow(channel, `genre-${genre}`))}
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              filteredChannels.map(channel => renderChannelRow(channel, 'filtered'))
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredChannels.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
          <Tv size={48} className="mb-4" />
          <p className="text-xl font-black uppercase tracking-widest">No Channels Found</p>
        </div>
      )}
    </div>
  );
};
