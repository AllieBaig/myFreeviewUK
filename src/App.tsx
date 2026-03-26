import React, { useState, useEffect } from 'react';
import { Programme, UserStats } from './types';
import { getTodaysSchedule } from './services/offline';
import { ProgrammeGrid } from './components/ProgrammeGrid';
import { GamificationHeader } from './components/GamificationHeader';
import { ProgrammeDetail } from './components/ProgrammeDetail';
import { motion, AnimatePresence } from 'motion/react';
import { Tv, Search, Settings, Bell, Calendar, LogIn, LogOut, User } from 'lucide-react';
import { auth, db, signIn, signOut, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    streak: 0,
    lastCheckIn: new Date().toISOString(),
    achievements: [],
    uid: ''
  });

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!user) return;

    const statsPath = `users/${user.uid}/stats/main`;
    const prefsPath = `users/${user.uid}/preferences/main`;

    const unsubStats = onSnapshot(doc(db, statsPath), (snapshot) => {
      if (snapshot.exists()) {
        setStats(snapshot.data() as UserStats);
      } else {
        // Initialize stats for new user
        const initialStats: UserStats = {
          xp: 0,
          level: 1,
          streak: 1,
          lastCheckIn: new Date().toISOString(),
          achievements: [],
          uid: user.uid
        };
        setDoc(doc(db, statsPath), initialStats).catch(e => handleFirestoreError(e, OperationType.WRITE, statsPath));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, statsPath));

    const unsubPrefs = onSnapshot(doc(db, prefsPath), (snapshot) => {
      if (snapshot.exists()) {
        setFavorites(snapshot.data().favoriteChannels || []);
      } else {
        // Initialize preferences for new user
        const initialPrefs = { favoriteChannels: [], uid: user.uid };
        setDoc(doc(db, prefsPath), initialPrefs).catch(e => handleFirestoreError(e, OperationType.WRITE, prefsPath));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, prefsPath));

    return () => {
      unsubStats();
      unsubPrefs();
    };
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getTodaysSchedule();
        setProgrammes(data);
      } catch (error) {
        console.error('Failed to load schedule:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleFavorite = async (channelId: string) => {
    if (!user) {
      alert("Please sign in to save favorites!");
      return;
    }
    const newFavs = favorites.includes(channelId)
      ? favorites.filter(id => id !== channelId)
      : [...favorites, channelId];
    
    const prefsPath = `users/${user.uid}/preferences/main`;
    try {
      await setDoc(doc(db, prefsPath), { favoriteChannels: newFavs, uid: user.uid }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, prefsPath);
    }
  };

  const handleCheckIn = async (p: Programme) => {
    if (!user) {
      alert("Please sign in to earn XP!");
      return;
    }
    const newXp = stats.xp + 50;
    const newLevel = Math.floor(newXp / 1000) + 1;
    const newStats = {
      ...stats,
      xp: newXp,
      level: newLevel,
      lastCheckIn: new Date().toISOString(),
      uid: user.uid
    };
    
    const statsPath = `users/${user.uid}/stats/main`;
    try {
      await setDoc(doc(db, statsPath), newStats);
      setSelectedProgramme(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, statsPath);
    }
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
          Syncing with Cloud...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <nav className="w-20 bg-[#111] border-r border-white/10 flex flex-col items-center py-8 gap-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Tv size={20} />
          </div>
          <div className="flex flex-col gap-6 opacity-40">
            <button className="p-2 hover:opacity-100 transition-opacity"><Search size={20} /></button>
            <button className="p-2 hover:opacity-100 transition-opacity"><Calendar size={20} /></button>
            <button className="p-2 hover:opacity-100 transition-opacity"><Bell size={20} /></button>
          </div>
          
          <div className="mt-auto flex flex-col gap-6 items-center pb-4">
            {user ? (
              <>
                <div className="relative group">
                  <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-white/20" />
                  <div className="absolute left-full ml-4 px-2 py-1 bg-black text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {user.displayName}
                  </div>
                </div>
                <button onClick={() => signOut()} className="p-2 opacity-40 hover:opacity-100 transition-opacity text-red-400">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <button onClick={() => signIn()} className="p-2 opacity-40 hover:opacity-100 transition-opacity text-blue-400">
                <LogIn size={20} />
              </button>
            )}
            <button className="p-2 opacity-40 hover:opacity-100 transition-opacity"><Settings size={20} /></button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col overflow-hidden">
          {user ? (
            <GamificationHeader stats={stats} />
          ) : (
            <div className="px-6 py-4 bg-blue-600/10 border-b border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User size={18} className="text-blue-400" />
                <span className="text-sm font-medium">Sign in to track your viewing streak and earn XP!</span>
              </div>
              <button onClick={() => signIn()} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-all">
                Sign In
              </button>
            </div>
          )}
          
          <div className="flex-grow relative">
            <ProgrammeGrid 
              programmes={programmes} 
              onProgrammeSelect={setSelectedProgramme}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
            />
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      <ProgrammeDetail 
        programme={selectedProgramme} 
        onClose={() => setSelectedProgramme(null)}
        onCheckIn={handleCheckIn}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
      `}} />
    </div>
  );
}
