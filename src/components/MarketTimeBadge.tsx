import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const MarketTimeBadge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  useEffect(() => {
    const checkTime = () => {
      // Calculate Nigerian time (WAT = UTC+1)
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const watDate = new Date(utc + (3600000 * 1));
      const hours = watDate.getHours();
      const mins = watDate.getMinutes();

      // Open 8:00 AM to 7:00 PM (19:00)
      const open = hours >= 8 && hours < 19;
      setIsOpen(open);
      
      const formatted = watDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTimeStr(formatted);
    };

    checkTime();
    const interval = setInterval(checkTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
        isOpen
          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
          : 'bg-rose-950/80 border-rose-500/40 text-rose-400'
      }`}
      title="Wuse Physical Market hours: 8:00 AM - 7:00 PM (WAT)"
    >
      <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
      <Clock className="w-3 h-3" />
      <span>{isOpen ? 'MARKET OPEN (8AM-7PM)' : 'MARKET CLOSED (Virtual 24/7)'}</span>
      <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">({currentTimeStr} WAT)</span>
    </div>
  );
};
