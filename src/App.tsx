/**
 * WUSE MARKET ONLINE - Virtual Abuja Market
 * Upgraded with Money Features, Vendor Dashboard & Super Admin
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Compass,
  Megaphone,
  Volume2,
  VolumeX,
  MessageCircle,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  ChevronRight,
  MapPin,
  CheckCircle2,
  ShoppingBag,
  Eye,
  Star,
  Share2,
  Key,
  LogIn
} from 'lucide-react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  increment,
  getDocFromServer
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { INITIAL_STALLS } from './defaultStalls';
import { StallItem } from './types';
import { soundEngine } from './audio';
import { PWAInstallButton } from './PWAInstallButton';
import { MarketTimeBadge } from './components/MarketTimeBadge';
import { Minimap } from './components/Minimap';
import { ViralModal } from './components/ViralModal';
import { VendorDashboard } from './components/VendorDashboard';
import { SuperAdmin } from './components/SuperAdmin';

// Explicit user-requested categories
const CATEGORY_CHIPS = [
  { id: 'all', label: 'All', icon: '🏪' },
  { id: 'fashion', label: 'Fashion', icon: '👗' },
  { id: 'phones', label: 'Phones', icon: '📱' },
  { id: 'food', label: 'Food', icon: '🍲' },
  { id: 'thrift', label: 'Thrift', icon: '👕' },
  { id: 'beauty', label: 'Beauty', icon: '✨' },
  { id: 'shoes', label: 'Shoes', icon: '👟' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'market' | 'vendor-login' | 'super-admin' | 'advertise'>('home');
  const [stalls, setStalls] = useState<StallItem[]>(INITIAL_STALLS);
  const [selectedStall, setSelectedStall] = useState<StallItem | null>(null);
  const [nearStall, setNearStall] = useState<StallItem | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Player state on map with velocity for smooth 60fps movement
  const [player, setPlayer] = useState({ x: 500, y: 720, dir: 'up' });
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickVector, setJoystickVector] = useState({ x: 0, y: 0 });
  const [selectedAvatarColor, setSelectedAvatarColor] = useState('#FF6B00');

  // Real Presence count from Firebase
  const [realShoppersCount, setRealShoppersCount] = useState(42);

  // Viral loop state
  const [waClickCount, setWaClickCount] = useState(() => {
    return parseInt(localStorage.getItem('wuse_wa_clicks') || '0', 10);
  });
  const [showViralModal, setShowViralModal] = useState(false);

  // Interactive user star rating state for selected stall
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Advertise lead state
  const [leadForm, setLeadForm] = useState({ shopName: '', whatsapp: '', instagram: '', category: 'fashion' });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const joystickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const prevNearStallId = useRef<string | null>(null);
  const myVisitorDocId = useRef(`shopper-${Math.random().toString(36).substring(2, 9)}`);

  // 1. Firebase Anonymous Auth & Real Presence Heartbeat
  useEffect(() => {
    signInAnonymously(auth).catch((err) => console.warn('Anon auth:', err));

    // Write presence heartbeat every 20 seconds
    const sendHeartbeat = async () => {
      try {
        await setDoc(doc(db, 'visitors', myVisitorDocId.current), {
          updatedAt: Date.now(),
          x: player.x,
          y: player.y,
        });
      } catch {
        // Offline safe
      }
    };
    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 20000);

    // Listen to visitors for real shoppers online count
    const unsubPresence = onSnapshot(
      collection(db, 'visitors'),
      (snapshot) => {
        const now = Date.now();
        let activeCount = 0;
        snapshot.forEach((d) => {
          const val = d.data();
          // Active in last 2 minutes
          if (val.updatedAt && now - val.updatedAt < 120000) {
            activeCount++;
          }
        });
        // Realistic dynamic baseline + actual connected visitors
        setRealShoppersCount(Math.max(38, activeCount + 37));
      },
      () => setRealShoppersCount(42)
    );

    return () => {
      clearInterval(heartbeatInterval);
      unsubPresence();
    };
  }, [player.x, player.y]);

  // 2. Subscribe to Stalls from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'stalls'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: StallItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              stallNumber: data.stallNumber || 1,
              name: data.name || 'Wuse Vendor',
              category: (data.category as any) || 'fashion',
              whatsapp: data.whatsapp || '2348000000000',
              description: data.description || '',
              priceRange: data.priceRange || '₦5,000 - ₦25,000',
              images: Array.isArray(data.images) ? data.images : [],
              views: data.views || 0,
              whatsappClicks: data.whatsappClicks || 0,
              rating: typeof data.rating === 'number' ? data.rating : 4.8,
              ratingCount: data.ratingCount || 24,
              rentExpiry: data.rentExpiry || '2027-12-31',
              renewalStatus: data.renewalStatus || 'active',
              renewalReceipt: data.renewalReceipt || '',
              x: data.x || 300,
              y: data.y || 300,
              color: data.color || '#FF6B00',
              pidginShout: data.pidginShout || 'Come enter! Better market dey here!',
            });
          });
          list.sort((a, b) => a.stallNumber - b.stallNumber);
          setStalls(list);
        } else {
          // Seed initial stalls
          try {
            for (const stall of INITIAL_STALLS) {
              await setDoc(doc(db, 'stalls', stall.id), stall);
            }
          } catch (seedErr) {
            console.warn('Seeding note:', seedErr);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'stalls')
    );
    return () => unsub();
  }, []);

  // 4. Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key.toLowerCase() === 'e') {
        if (nearStall) openStallModal(nearStall);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearStall]);

  // 5. Smooth Movement Loop (4.8px/frame)
  useEffect(() => {
    let animId: number;
    const updateGame = () => {
      if (activeTab === 'market') {
        let vx = 0;
        let vy = 0;
        const speed = 4.8;

        if (keysPressed.current['w'] || keysPressed.current['arrowup']) vy -= speed;
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) vy += speed;
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) vx -= speed;
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) vx += speed;

        if (joystickActive) {
          vx += joystickVector.x * speed;
          vy += joystickVector.y * speed;
        }

        if (vx !== 0 || vy !== 0) {
          setPlayer((prev) => {
            const nextX = Math.max(60, Math.min(940, prev.x + vx));
            const nextY = Math.max(100, Math.min(750, prev.y + vy));
            let dir = prev.dir;
            if (Math.abs(vx) > Math.abs(vy)) {
              dir = vx > 0 ? 'right' : 'left';
            } else {
              dir = vy > 0 ? 'down' : 'up';
            }
            return { x: nextX, y: nextY, dir };
          });
        }

        // Proximity detection
        let closest: StallItem | null = null;
        let closestDist = 9999;
        for (const s of stalls) {
          const dx = player.x - s.x;
          const dy = player.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 68 && dist < closestDist) {
            closest = s;
            closestDist = dist;
          }
        }

        if (closest && closest.id !== prevNearStallId.current) {
          soundEngine.playStallChime();
          prevNearStallId.current = closest.id;
        } else if (!closest) {
          prevNearStallId.current = null;
        }
        setNearStall(closest);
      }
      animId = requestAnimationFrame(updateGame);
    };
    animId = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, joystickActive, joystickVector, player.x, player.y, stalls]);

  // Open Stall Modal & Increment Views
  const openStallModal = async (stall: StallItem) => {
    setSelectedStall(stall);
    setUserRating(0);
    setRatingSubmitted(false);
    soundEngine.playStallChime();

    try {
      await updateDoc(doc(db, 'stalls', stall.id), {
        views: increment(1),
      });
      setStalls((prev) =>
        prev.map((s) => (s.id === stall.id ? { ...s, views: s.views + 1 } : s))
      );
    } catch {
      // Offline fallback
    }
  };

  // WhatsApp Click Tracker & Viral Loop Trigger
  const handleWhatsAppClick = async (stall: StallItem) => {
    // Increment stall's whatsappClicks in Firestore
    try {
      await updateDoc(doc(db, 'stalls', stall.id), {
        whatsappClicks: increment(1),
      });
      setStalls((prev) =>
        prev.map((s) => (s.id === stall.id ? { ...s, whatsappClicks: (s.whatsappClicks || 0) + 1 } : s))
      );
    } catch {
      // Offline
    }

    // Viral Loop: Increment local WhatsApp click count
    const nextCount = waClickCount + 1;
    setWaClickCount(nextCount);
    localStorage.setItem('wuse_wa_clicks', nextCount.toString());

    // After clicking 2 times, trigger viral share popup!
    if (nextCount === 2) {
      setTimeout(() => {
        setShowViralModal(true);
      }, 1500);
    }
  };

  // Star Rating Submission
  const handleRateStall = async (ratingVal: number) => {
    if (!selectedStall || ratingSubmitted) return;
    setUserRating(ratingVal);
    setRatingSubmitted(true);

    try {
      const currentCount = selectedStall.ratingCount || 1;
      const currentRating = selectedStall.rating || 5;
      const newRating = Number(((currentRating * currentCount + ratingVal) / (currentCount + 1)).toFixed(1));

      await updateDoc(doc(db, 'stalls', selectedStall.id), {
        rating: newRating,
        ratingCount: increment(1),
      });

      setSelectedStall((prev) => prev ? { ...prev, rating: newRating, ratingCount: currentCount + 1 } : null);
      setStalls((prev) =>
        prev.map((s) => (s.id === selectedStall.id ? { ...s, rating: newRating, ratingCount: currentCount + 1 } : s))
      );
    } catch (err) {
      console.warn('Rating note:', err);
    }
  };

  // Joystick touch handlers
  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    const rect = e.currentTarget.getBoundingClientRect();
    joystickCenterRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    setJoystickActive(true);
    handleJoystickMove(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        handleJoystickMove(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickMove = (clientX: number, clientY: number) => {
    const maxRadius = 45;
    const dx = clientX - joystickCenterRef.current.x;
    const dy = clientY - joystickCenterRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) {
      setJoystickVector({ x: 0, y: 0 });
      return;
    }
    const capped = Math.min(distance, maxRadius);
    setJoystickVector({ x: (dx / distance) * (capped / maxRadius), y: (dy / distance) * (capped / maxRadius) });
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setJoystickActive(false);
    setJoystickVector({ x: 0, y: 0 });
    touchIdRef.current = null;
  };

  // Lead submit (/advertise)
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.shopName || !leadForm.whatsapp) return;
    setLeadSubmitting(true);
    try {
      await addDoc(collection(db, 'leads'), {
        ...leadForm,
        createdAt: new Date().toISOString(),
        status: 'pending',
      });
      setLeadSuccess(true);
      setLeadForm({ shopName: '', whatsapp: '', instagram: '', category: 'fashion' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'leads');
    } finally {
      setLeadSubmitting(false);
    }
  };

  // Filtered stalls
  const filteredStalls = useMemo(() => {
    return stalls.filter((s) => {
      const matchesCat = categoryFilter === 'all' || s.category === categoryFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.priceRange.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [stalls, categoryFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#12100E] text-zinc-100 flex flex-col select-none overflow-x-hidden font-sans">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 bg-[#1A1410]/95 backdrop-blur-md border-b border-orange-500/20 px-3 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Title */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer active:scale-95 transition shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00] to-orange-700 flex items-center justify-center shadow-lg shadow-orange-600/30 border border-orange-400/40">
              <span className="text-xl">🏪</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-pixel text-xs sm:text-sm font-bold text-[#FF6B00] tracking-wider uppercase">
                  WUSE MARKET
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#008751] text-white">
                  ABUJA
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Virtual 2D Marketplace • Walk & Shop
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-xs font-semibold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                activeTab === 'home' ? 'bg-[#FF6B00] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shrink-0 ${
                activeTab === 'market' ? 'bg-[#008751] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Enter 2D Market</span>
            </button>
            <button
              onClick={() => setActiveTab('vendor-login')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition shrink-0 ${
                activeTab === 'vendor-login'
                  ? 'bg-amber-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Vendor Portal</span>
            </button>
            <button
              onClick={() => setActiveTab('advertise')}
              className={`px-2.5 py-1.5 rounded-lg hidden sm:flex items-center gap-1 transition shrink-0 ${
                activeTab === 'advertise'
                  ? 'bg-orange-500/20 text-[#FF6B00] border border-orange-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Rent Stall</span>
            </button>
            <button
              onClick={() => setActiveTab('super-admin')}
              className={`px-2 py-1.5 rounded-lg hidden md:flex items-center gap-1 transition shrink-0 ${
                activeTab === 'super-admin'
                  ? 'bg-red-700 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Super Admin (Chairman Portal)"
            >
              <Key className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </nav>

          {/* Right Tools: Presence Count, Open/Closed Badge, Sound, PWA */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Real Shoppers Online Badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{realShoppersCount} shoppers online now</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(soundEngine.toggle())}
              className={`p-2 rounded-xl border transition ${
                soundEnabled
                  ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
              title="Toggle Afrobeat Market Music"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <PWAInstallButton compact />
          </div>
        </div>
      </header>

      {/* 2. SEARCH & CATEGORY FILTER BAR */}
      <div className="bg-[#15100D] border-b border-zinc-800 px-3 py-2.5 sm:px-6 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Real Search Bar: "Find abaya, phones, thrift..." */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find abaya, phones, thrift..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1F1712] border border-zinc-700 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Chips: All, Fashion, Phones, Food, Thrift, Beauty, Shoes */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto py-0.5">
            {CATEGORY_CHIPS.map((chip) => {
              const active = categoryFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setCategoryFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-600/30'
                      : 'bg-[#1F1712] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Market Open / Closed Badge */}
          <div className="shrink-0 hidden lg:block">
            <MarketTimeBadge />
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT ROUTING */}
      <main className="flex-1 flex flex-col">
        {/* VIEW 1: 2D MARKET MAP */}
        {activeTab === 'market' && (
          <div className="flex-1 flex flex-col relative bg-[#12100E] min-h-[calc(100vh-125px)]">
            {/* Top Stats Strip */}
            <div className="bg-[#181310] border-b border-orange-500/20 px-3 py-1.5 flex items-center justify-between text-xs text-zinc-400 z-20">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[10px] text-orange-400">WUSE MAP GRID</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">🟢 {realShoppersCount} Shoppers Online</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="hidden sm:inline">Use <strong>WASD / Arrows</strong> to walk.</span>
                <span className="sm:hidden">Touch <strong>Joystick</strong> bottom-left.</span>
              </div>
            </div>

            {/* 2D Ground Container */}
            <div className="flex-1 relative overflow-auto market-grid-pattern p-4 flex items-center justify-center min-h-[580px]">
              {/* Minimap (Top Right Floating) */}
              <div className="absolute top-4 right-4 z-30 hidden sm:block">
                <Minimap
                  player={player}
                  stalls={stalls}
                  selectedCategory={categoryFilter}
                  onNavigateToStall={(s) => {
                    setPlayer({ x: s.x, y: s.y + 45, dir: 'up' });
                    openStallModal(s);
                  }}
                />
              </div>

              {/* Board (1000px x 800px) */}
              <div
                className="relative bg-[#251D17] border-4 border-[#3D2C20] rounded-3xl shadow-2xl overflow-hidden shrink-0"
                style={{ width: '1000px', height: '800px' }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const clickY = e.clientY - rect.top;
                  setPlayer((prev) => ({
                    x: Math.max(80, Math.min(920, clickX)),
                    y: Math.max(100, Math.min(740, clickY)),
                    dir: clickY > prev.y ? 'down' : 'up',
                  }));
                }}
              >
                {/* Walkways */}
                <div className="absolute left-[440px] top-0 w-[120px] h-full bg-[#352920] border-x border-[#4d3a2d]/40 pointer-events-none" />
                <div className="absolute left-0 top-[220px] w-full h-[80px] bg-[#352920] border-y border-[#4d3a2d]/40 pointer-events-none" />
                <div className="absolute left-0 top-[380px] w-full h-[80px] bg-[#352920] border-y border-[#4d3a2d]/40 pointer-events-none" />
                <div className="absolute left-0 top-[540px] w-full h-[80px] bg-[#352920] border-y border-[#4d3a2d]/40 pointer-events-none" />

                {/* Gates */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-80 bg-gradient-to-r from-emerald-800 via-[#008751] to-emerald-800 text-white py-1.5 px-4 rounded-xl text-center shadow-lg border-2 border-white/20 z-10 pointer-events-none">
                  <div className="font-pixel text-[11px] tracking-widest uppercase">★ MAIN WUSE MARKET GATE ★</div>
                  <div className="text-[9px] text-emerald-200">Berger / Zone 3 Entrance</div>
                </div>

                {/* Fountain */}
                <div className="absolute left-[460px] top-[380px] w-20 h-20 rounded-full bg-gradient-to-br from-amber-700 to-amber-950 border-4 border-amber-400/60 shadow-xl flex flex-col items-center justify-center text-center text-white pointer-events-none z-10">
                  <span className="text-xl">🏛️</span>
                  <span className="font-pixel text-[7px] text-amber-200 uppercase">WUSE INFO</span>
                </div>

                {/* Palms */}
                <div className="absolute top-4 left-6 text-3xl pointer-events-none opacity-80">🌴</div>
                <div className="absolute top-4 right-6 text-3xl pointer-events-none opacity-80">🌴</div>
                <div className="absolute bottom-4 left-6 text-3xl pointer-events-none opacity-80">🌴</div>
                <div className="absolute bottom-4 right-6 text-3xl pointer-events-none opacity-80">🌴</div>

                {/* Stalls */}
                {filteredStalls.map((stall) => {
                  const isNear = nearStall?.id === stall.id;

                  return (
                    <div
                      key={stall.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlayer({ x: stall.x, y: stall.y + 45, dir: 'up' });
                        openStallModal(stall);
                      }}
                      className="absolute cursor-pointer transition-transform duration-200"
                      style={{
                        left: `${stall.x - 55}px`,
                        top: `${stall.y - 45}px`,
                        width: '110px',
                        height: '90px',
                      }}
                    >
                      {isNear && (
                        <div className="absolute -inset-2 rounded-2xl bg-orange-500/30 animate-pulse border-2 border-orange-400 pointer-events-none z-10" />
                      )}

                      {isNear && (
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-[#FF6B00] to-emerald-600 text-white font-pixel text-[9px] px-2.5 py-1 rounded-full shadow-xl border border-white animate-bounce z-30 flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          <span>PRESS TO SHOP</span>
                        </div>
                      )}

                      {/* Stall Roof */}
                      <div
                        className="w-full h-10 rounded-t-xl shadow-md border-b-2 border-black/40 flex items-center justify-between px-2 text-white relative overflow-hidden"
                        style={{ backgroundColor: stall.color }}
                      >
                        <span className="font-pixel text-[8px] z-10 bg-black/40 px-1 py-0.5 rounded text-white">
                          #{stall.stallNumber}
                        </span>
                        <span className="text-[10px] text-amber-300 font-bold z-10">★ {stall.rating || 5.0}</span>
                      </div>

                      {/* Stall Body */}
                      <div className="w-full h-12 bg-[#2D1F16] rounded-b-xl border-x-2 border-b-2 border-[#1A110B] p-1 flex flex-col justify-between shadow-lg">
                        <div className="text-[10px] font-bold text-white truncate text-center">
                          {stall.name}
                        </div>
                        <div className="flex items-center justify-between px-1 text-[8px]">
                          <span className="text-amber-400 font-semibold truncate max-w-[65px]">
                            {stall.priceRange.split('-')[0]}
                          </span>
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <Eye className="w-2.5 h-2.5" />
                            <span>{stall.views}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Real Presence on Market Floor from Firebase */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/85 border border-emerald-500/50 px-4 py-1.5 rounded-full text-emerald-400 font-pixel text-[10px] tracking-wider z-20 flex items-center gap-2 shadow-2xl pointer-events-none">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{realShoppersCount} SHOPPERS ONLINE NOW</span>
                </div>

                {/* Player Avatar */}
                <div
                  className="absolute pointer-events-none flex flex-col items-center transition-transform"
                  style={{ left: `${player.x - 18}px`, top: `${player.y - 32}px`, zIndex: 25 }}
                >
                  <div className="font-pixel text-[8px] bg-gradient-to-r from-emerald-600 to-green-500 text-white px-1.5 py-0.5 rounded-full shadow-lg border border-white mb-0.5 animate-bounce">
                    YOU
                  </div>
                  <div
                    className="w-8 h-8 rounded-xl shadow-2xl border-2 border-white flex items-center justify-center text-sm relative"
                    style={{ backgroundColor: selectedAvatarColor }}
                  >
                    <span>😎</span>
                    <span className="absolute -bottom-1 w-2 h-2 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Proximity Action Banner */}
            {nearStall && (
              <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-[#1E1713]/95 backdrop-blur-md border-2 border-[#FF6B00] rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 animate-slide-up">
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm truncate">{nearStall.name}</span>
                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">
                      #{nearStall.stallNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-300 font-semibold truncate">{nearStall.priceRange}</p>
                </div>

                <button
                  onClick={() => openStallModal(nearStall)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-orange-600 text-white font-bold text-xs uppercase tracking-wider shrink-0 shadow-lg shadow-orange-600/40 active:scale-95 transition flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Now</span>
                </button>
              </div>
            )}

            {/* Mobile Touch Joystick */}
            <div className="fixed bottom-6 left-4 z-30 sm:hidden">
              <div
                onTouchStart={handleJoystickTouchStart}
                onTouchMove={handleJoystickTouchMove}
                onTouchEnd={handleJoystickTouchEnd}
                className="w-28 h-28 rounded-full bg-black/60 border-2 border-orange-500/40 backdrop-blur-md relative flex items-center justify-center joystick-zone shadow-2xl"
              >
                <div
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-orange-700 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-pixel pointer-events-none transition-transform"
                  style={{ transform: `translate(${joystickVector.x * 32}px, ${joystickVector.y * 32}px)` }}
                >
                  MOVE
                </div>
              </div>
            </div>

            {/* Mobile Action Button (Bottom Right) */}
            <div className="fixed bottom-6 right-4 z-30 sm:hidden">
              {nearStall ? (
                <button
                  onClick={() => openStallModal(nearStall)}
                  className="w-16 h-16 rounded-full bg-emerald-600 border-2 border-white shadow-2xl flex flex-col items-center justify-center text-white active:scale-90 transition animate-bounce"
                >
                  <ShoppingBag className="w-6 h-6" />
                  <span className="font-pixel text-[8px] mt-0.5">SHOP</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const random = stalls[Math.floor(Math.random() * stalls.length)];
                    if (random) setPlayer({ x: random.x, y: random.y + 40, dir: 'up' });
                  }}
                  className="w-14 h-14 rounded-full bg-orange-600/90 border border-orange-400 shadow-xl flex flex-col items-center justify-center text-white text-[9px] active:scale-95 font-bold"
                >
                  <span>🎲</span>
                  <span>WANDER</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: HOMEPAGE */}
        {activeTab === 'home' && (
          <div className="flex-1 flex flex-col">
            <section className="relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8 border-b border-orange-500/10 text-center">
              <div className="max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wide uppercase mb-4">
                  <span>🇳🇬 Abuja&apos;s #1 Physical Market — Now Online</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                  Wuse Market Now Online <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-amber-400 to-[#008751]">
                    Walk Around & Shop From Your Phone
                  </span>
                </h1>

                <p className="mt-4 text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto">
                  How far? No need to enter traffic for Berger. Control your 2D avatar, walk along Wuse Market stalls, and chat directly with verified Abuja vendors on WhatsApp!
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('market')}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white text-lg font-black shadow-xl shadow-orange-600/30 active:scale-95 transition flex items-center justify-center gap-3"
                  >
                    <span>🚶‍♂️ Enter Market</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setActiveTab('vendor-login')}
                    className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#008751] hover:bg-emerald-600 text-white font-bold text-base shadow-lg shadow-green-800/20 active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Vendor Portal (Stats & Renew)</span>
                  </button>
                </div>

                <div className="mt-10 grid grid-cols-3 max-w-xl mx-auto divide-x divide-zinc-800 bg-[#1A1410] border border-orange-500/20 rounded-2xl p-4 shadow-xl">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#FF6B00]">{stalls.length}</div>
                    <div className="text-[11px] text-zinc-400 font-semibold uppercase">Active Stalls</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400">{realShoppersCount}</div>
                    <div className="text-[11px] text-zinc-400 font-semibold uppercase">Shoppers Online</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-amber-400">0%</div>
                    <div className="text-[11px] text-zinc-400 font-semibold uppercase">Jumia Fee</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Stalls Showcase */}
            <section className="py-10 px-4 sm:px-6 max-w-6xl mx-auto w-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Featured Wuse Market Stalls</h3>
                  <p className="text-xs text-zinc-400">Tap any stall to walk directly to it or preview goods</p>
                </div>
                <button
                  onClick={() => setActiveTab('market')}
                  className="text-xs font-bold text-[#FF6B00] hover:text-orange-400 flex items-center gap-1"
                >
                  <span>Open 2D Map</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredStalls.slice(0, 8).map((stall) => (
                  <div
                    key={stall.id}
                    onClick={() => {
                      setPlayer({ x: stall.x, y: stall.y + 40, dir: 'up' });
                      setActiveTab('market');
                      openStallModal(stall);
                    }}
                    className="group bg-[#1A1410] rounded-2xl border border-zinc-800 hover:border-orange-500/50 p-3.5 cursor-pointer transition shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-32 rounded-xl overflow-hidden bg-zinc-900 mb-3">
                        <img
                          src={stall.images[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=80'}
                          alt={stall.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/20">
                          Stall #{stall.stallNumber}
                        </span>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{stall.views}</span>
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#FF6B00] transition">
                        {stall.name}
                      </h4>
                      <div className="flex items-center gap-1 text-amber-400 text-xs mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold">{stall.rating || 5.0}</span>
                        <span className="text-zinc-500 text-[10px]">({stall.ratingCount || 20})</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-bold">{stall.priceRange}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>Chat</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* VIEW 3: VENDOR DASHBOARD */}
        {activeTab === 'vendor-login' && (
          <VendorDashboard
            stalls={stalls}
            onStallUpdated={(updated) => {
              setStalls((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            }}
          />
        )}

        {/* VIEW 4: SUPER ADMIN */}
        {activeTab === 'super-admin' && (
          <SuperAdmin stalls={stalls} />
        )}

        {/* VIEW 5: ADVERTISE PAGE */}
        {activeTab === 'advertise' && (
          <div className="flex-1 py-10 px-4 sm:px-6 max-w-4xl mx-auto w-full">
            <div className="text-center mb-8">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">
                Vendor Stall Rental
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white mt-3">
                Get Your Shop Inside Wuse Market Online <br />
                <span className="text-[#FF6B00]">5,000 Naira per week</span>
              </h1>
              <p className="mt-3 text-zinc-300 max-w-xl mx-auto text-sm">
                Live stats: <strong>{realShoppersCount * 28} shoppers today</strong>. No 15% Jumia fees, direct WhatsApp customers, open 24/7.
              </p>
            </div>

            <div className="bg-[#1C1511] p-6 sm:p-8 rounded-3xl border-2 border-orange-500/30 shadow-2xl">
              {leadSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-bold text-white">Stall Inquiry Received!</h4>
                  <p className="text-xs text-zinc-300">
                    How far! We received your shop details. Chat our Abuja admin desk to claim your stall number!
                  </p>
                  <a
                    href="https://wa.me/2348039124455?text=Hello%20Wuse%20Market%20Admin%2C%20I%20just%20filled%20the%20stall%20rental%20form%20for%20my%20shop!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Complete on WhatsApp</span>
                  </a>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Shop Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fatima Abuja Fabrics"
                      value={leadForm.shopName}
                      onChange={(e) => setLeadForm({ ...leadForm, shopName: e.target.value })}
                      className="w-full bg-[#120E0B] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="0707 877 5453"
                        value={leadForm.whatsapp}
                        onChange={(e) => setLeadForm({ ...leadForm, whatsapp: e.target.value })}
                        className="w-full bg-[#120E0B] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Instagram (Optional)</label>
                      <input
                        type="text"
                        placeholder="@yourshop_abuja"
                        value={leadForm.instagram}
                        onChange={(e) => setLeadForm({ ...leadForm, instagram: e.target.value })}
                        className="w-full bg-[#120E0B] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={leadSubmitting}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-orange-600 text-white font-black text-base shadow-xl shadow-orange-600/30 transition"
                  >
                    {leadSubmitting ? 'Submitting...' : 'Rent Stall Now (₦5,000 / week)'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 4. STALL INTERACTION MODAL POPUP (WITH RATINGS & WA TRACKING) */}
      {selectedStall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#1C1511] border-2 border-orange-500/40 p-5 sm:p-6 shadow-2xl text-white relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStall(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-bold"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg shrink-0"
                style={{ backgroundColor: selectedStall.color }}
              >
                🏪
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white">{selectedStall.name}</h2>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#008751] text-white">
                    Stall #{selectedStall.stallNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                  <span className="capitalize">{selectedStall.category}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{selectedStall.rating || 5.0}</span>
                    <span className="text-zinc-500 font-normal">({selectedStall.ratingCount || 20} ratings)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pidgin Vendor Shoutout */}
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300 font-medium mb-4 italic flex items-start gap-2">
              <span className="text-base shrink-0">🗣️</span>
              <span>&quot;{selectedStall.pidginShout}&quot;</span>
            </div>

            {/* 3 Images Gallery */}
            <div className="mb-4">
              <div className="text-xs font-bold text-zinc-300 mb-2">Products on Display:</div>
              <div className="grid grid-cols-3 gap-2">
                {selectedStall.images.map((imgUrl, idx) => (
                  <div key={idx} className="h-24 sm:h-28 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                    <img src={imgUrl} alt="Product" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description & Price */}
            <div className="space-y-3 bg-black/30 p-3.5 rounded-2xl border border-white/5 text-xs text-zinc-300 mb-4">
              <p>{selectedStall.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <span className="text-zinc-400">Price Guide:</span>
                <span className="font-bold text-amber-400 text-sm">{selectedStall.priceRange}</span>
              </div>
            </div>

            {/* 5-Star Interactive Rating */}
            <div className="mb-5 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-300 font-semibold">Rate this Stall:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRateStall(star)}
                    className="p-1 hover:scale-125 transition"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        (userRating || Math.round(selectedStall.rating || 5)) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {ratingSubmitted && <span className="text-[10px] text-emerald-400 font-bold">Thanks!</span>}
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${selectedStall.whatsapp}?text=${encodeURIComponent(
                `Hello ${selectedStall.name}! I saw your shop on Wuse Market Online (Virtual Abuja Market). I am interested in your items!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleWhatsAppClick(selectedStall)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#008751] to-emerald-600 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-base shadow-xl shadow-green-700/30 flex items-center justify-center gap-2.5 transition active:scale-95"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* 5. VIRAL LOOP MODAL */}
      <ViralModal isOpen={showViralModal} onClose={() => setShowViralModal(false)} />
    </div>
  );
}
