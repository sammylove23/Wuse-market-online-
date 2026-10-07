import React, { useState } from 'react';
import { Share2, Gift, CheckCircle, X, Sparkles, MessageCircle } from 'lucide-react';

interface ViralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ViralModal: React.FC<ViralModalProps> = ({ isOpen, onClose }) => {
  const [userName, setUserName] = useState('');
  const [hasShared, setHasShared] = useState(false);

  if (!isOpen) return null;

  const handleShare = () => {
    const nameSlug = encodeURIComponent(userName.trim() || 'MYNAME');
    const shareText = `Guy, I dey shop for Wuse Market from my phone, no need to enter traffic o! Check am: wusemarket.app/?ref=${nameSlug}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    
    // Open WhatsApp
    window.open(waUrl, '_blank');
    setHasShared(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#1C1511] border-2 border-orange-500/50 rounded-3xl p-6 shadow-2xl text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mx-auto flex items-center justify-center text-2xl shadow-xl shadow-orange-500/30">
            🎁
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Abuja Shopper Perk</span>
          </div>

          <h3 className="text-xl font-black text-white">
            Love this market? <br />
            <span className="text-[#FF6B00]">Share & Unlock Free Delivery List</span>
          </h3>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Share Wuse Market Online with 3 friends on WhatsApp to unlock our VIP list of verified Abuja dispatch riders offering free & discount deliveries!
          </p>

          {!hasShared ? (
            <div className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="Enter your first name (e.g. Samuel)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#120E0B] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />

              <button
                onClick={handleShare}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#008751] to-emerald-600 hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-green-700/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share on WhatsApp & Unlock</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-left space-y-2 mt-3">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>VIP Abuja Delivery Partners Unlocked!</span>
              </div>
              <ul className="text-[11px] text-zinc-300 space-y-1 list-disc pl-4">
                <li><strong>Bolt Express Wuse</strong>: 15% off intra-Abuja parcel delivery (Code: WUSE15)</li>
                <li><strong>Garki Direct Dispatch</strong>: Same-day delivery across Maitama, Wuse 2 & Jabi: ₦1,200 flat</li>
                <li><strong>Airport Road Logistics</strong>: Daily runs to Lugbe & Gwarinpa</li>
              </ul>
              <button
                onClick={onClose}
                className="w-full mt-2 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
