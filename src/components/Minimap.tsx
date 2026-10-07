import React from 'react';
import { StallItem } from '../types';

interface MinimapProps {
  player: { x: number; y: number };
  stalls: StallItem[];
  selectedCategory: string;
  onNavigateToStall?: (stall: StallItem) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  player,
  stalls,
  selectedCategory,
  onNavigateToStall,
}) => {
  // Map dimensions are 1000 x 800. Minimap scale: 140px x 112px
  const mapWidth = 1000;
  const mapHeight = 800;
  const miniWidth = 140;
  const miniHeight = 112;

  const scaleX = miniWidth / mapWidth;
  const scaleY = miniHeight / mapHeight;

  return (
    <div className="bg-black/85 border border-orange-500/40 rounded-xl p-1.5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between text-[9px] font-pixel text-orange-400 mb-1 px-1">
        <span>MINIMAP</span>
        <span className="text-zinc-400 font-mono">WUSE 2D</span>
      </div>
      <div
        className="relative bg-[#1A130E] border border-zinc-700 rounded-lg overflow-hidden"
        style={{ width: `${miniWidth}px`, height: `${miniHeight}px` }}
      >
        {/* Paved Walkway cross lines */}
        <div
          className="absolute bg-zinc-800 pointer-events-none"
          style={{
            left: `${440 * scaleX}px`,
            top: 0,
            width: `${120 * scaleX}px`,
            height: '100%',
          }}
        />
        <div
          className="absolute bg-zinc-800 pointer-events-none"
          style={{
            left: 0,
            top: `${220 * scaleY}px`,
            width: '100%',
            height: `${80 * scaleY}px`,
          }}
        />
        <div
          className="absolute bg-zinc-800 pointer-events-none"
          style={{
            left: 0,
            top: `${380 * scaleY}px`,
            width: '100%',
            height: `${80 * scaleY}px`,
          }}
        />
        <div
          className="absolute bg-zinc-800 pointer-events-none"
          style={{
            left: 0,
            top: `${540 * scaleY}px`,
            width: '100%',
            height: `${80 * scaleY}px`,
          }}
        />

        {/* Center Fountain */}
        <div
          className="absolute rounded-full bg-amber-500/50 pointer-events-none"
          style={{
            left: `${460 * scaleX}px`,
            top: `${380 * scaleY}px`,
            width: `${80 * scaleX}px`,
            height: `${80 * scaleY}px`,
          }}
        />

        {/* Stalls Dots */}
        {stalls.map((s) => {
          const match = selectedCategory === 'all' || s.category === selectedCategory;
          return (
            <div
              key={s.id}
              onClick={() => onNavigateToStall?.(s)}
              className="absolute rounded-sm cursor-pointer hover:scale-150 transition-transform"
              title={`${s.name} (#${s.stallNumber})`}
              style={{
                left: `${s.x * scaleX - 3}px`,
                top: `${s.y * scaleY - 3}px`,
                width: '6px',
                height: '6px',
                backgroundColor: s.color,
                opacity: match ? 1 : 0.3,
                boxShadow: match ? '0 0 4px rgba(255,255,255,0.8)' : 'none',
              }}
            />
          );
        })}

        {/* Player Indicator (Flashing Green Dot) */}
        <div
          className="absolute rounded-full bg-emerald-400 border border-white pointer-events-none animate-ping"
          style={{
            left: `${player.x * scaleX - 3.5}px`,
            top: `${player.y * scaleY - 3.5}px`,
            width: '7px',
            height: '7px',
          }}
        />
        <div
          className="absolute rounded-full bg-emerald-400 border border-white pointer-events-none shadow"
          style={{
            left: `${player.x * scaleX - 3.5}px`,
            top: `${player.y * scaleY - 3.5}px`,
            width: '7px',
            height: '7px',
          }}
        />
      </div>
    </div>
  );
};
