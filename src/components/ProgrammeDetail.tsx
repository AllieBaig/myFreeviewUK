import React from 'react';
import { Programme, Channel, CHANNELS } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Clock, Info, Share2, Heart, Trophy } from 'lucide-react';
import { format } from 'date-fns';

interface ProgrammeDetailProps {
  programme: Programme | null;
  onClose: () => void;
  onCheckIn: (p: Programme) => void;
  onPlay: (p: Programme) => void;
}

export const ProgrammeDetail: React.FC<ProgrammeDetailProps> = ({ programme, onClose, onCheckIn, onPlay }) => {
  if (!programme) return null;

  const channel = CHANNELS.find(c => c.id === programme.channelId);

  const handlePlay = () => {
    onPlay(programme);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/60 hover:text-white transition-all z-10"
          >
            <X size={20} />
          </button>

          <div className="relative h-64 overflow-hidden">
            <img 
              src={programme.thumbnail} 
              alt={programme.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/40 to-transparent" />
            <div className="absolute bottom-6 left-8 right-8">
              <div className="flex items-center gap-3 mb-2">
                <img src={channel?.logo} alt={channel?.name} className="h-6 object-contain" />
                <span className="text-xs font-bold opacity-60 uppercase tracking-widest">{programme.genre}</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight">{programme.title}</h1>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center gap-6 mb-8 text-sm opacity-60">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{format(new Date(programme.startTime), 'HH:mm')} - {format(new Date(programme.endTime), 'HH:mm')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Info size={16} />
                <span>Today</span>
              </div>
            </div>

            <p className="text-lg leading-relaxed text-white/80 mb-8">
              {programme.description}
            </p>

            <div className="flex items-center gap-4">
              <button 
                onClick={handlePlay}
                className="flex-grow flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.4)]"
              >
                <Play size={20} fill="currentColor" />
                Watch Now & Earn +50 XP
              </button>
              <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all">
                <Heart size={20} />
              </button>
              <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all">
                <Share2 size={20} />
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Trophy size={16} className="text-yellow-500" />
                </div>
                <span className="text-xs font-bold opacity-60">Quest: Watch 3 {programme.genre} shows this week</span>
              </div>
              <span className="text-[10px] font-mono opacity-30">ID: {programme.id}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
