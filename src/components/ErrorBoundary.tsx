import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { hasError, error } = (this as any).state;
    const { children } = (this as any).props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center selection:bg-red-500/30">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]"
          >
            <AlertTriangle className="text-red-500" size={48} />
          </motion.div>
          
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            System Failure
          </h1>
          
          <p className="text-white/40 text-sm max-w-xs mb-10 leading-relaxed font-medium">
            The application encountered a critical error. This usually happens due to corrupted cache or a temporary network glitch.
          </p>
          
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-3 w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95"
            >
              <RefreshCcw size={16} />
              Restart Application
            </button>
            
            <button 
              onClick={() => {
                localStorage.clear();
                // Clear IndexedDB if possible
                if ('indexedDB' in window) {
                  indexedDB.deleteDatabase('keyval-store');
                }
                window.location.reload();
              }}
              className="w-full py-4 bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all border border-white/5"
            >
              Force Reset & Clear Cache
            </button>
          </div>
          
          {error && (
            <div className="mt-12 w-full max-w-md">
              <div className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 text-left">Error Log</div>
              <pre className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl text-left text-[10px] text-red-400/60 overflow-auto font-mono leading-relaxed">
                {error.name}: {error.message}
                {error.stack && `\n\n${error.stack.split('\n').slice(0, 3).join('\n')}`}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return children;
  }
}
