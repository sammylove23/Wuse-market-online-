import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 font-bold text-white shadow-lg shadow-green-900/40 hover:brightness-110 active:scale-95 transition-all ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'
        }`}
        title="Install Wuse Market App"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-orange-400/40 bg-orange-500/10 font-bold text-orange-300 hover:bg-orange-500/20 active:scale-95 transition-all ${
            compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
          }`}
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Add to Home Screen</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl border-2 border-orange-500/30 bg-[#1e1713] p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-orange-500/20">
                <h3 className="font-bold text-lg text-orange-400">Install on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-xs text-white">1</span>
                  <p>Tap the <strong>Share</strong> button (box with upward arrow) at bottom of Safari.</p>
                </div>
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-xs text-white">2</span>
                  <p>Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                </div>
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-xs text-white">3</span>
                  <p>Tap <strong>Add</strong> top right to launch full-screen anytime!</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-orange-600 py-2.5 font-bold text-white hover:bg-orange-500 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback helpful prompt for browsers that haven't triggered beforeinstallprompt yet
  return (
    <button
      onClick={() => {
        alert("To install Wuse Market Online: Tap your browser menu (⋮ or Share) and select 'Add to Home screen' or 'Install app'!");
      }}
      className={`flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 font-semibold text-zinc-300 hover:bg-white/10 active:scale-95 transition-all ${
        compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'
      }`}
    >
      <Download className="w-3.5 h-3.5 text-orange-400" />
      <span>Install PWA</span>
    </button>
  );
};
