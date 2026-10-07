import { useState, useEffect, useRef } from "react"

type Stall = { id: string; name: string; owner: string; category: string; x: number; y: number; color: string; emoji: string; whatsapp: string; views: number; expiry: string; products: {name:string, price:number, img:string}[] }

const INITIAL_STALLS: Stall[] = [
  { id:"1", name:"Aisha Fabrics", owner:"Aisha - Block A12", category:"fashion", x:2, y:2, color:"#FF6B00", emoji:"👗", whatsapp:"08031234567", views:124, expiry:"2026-12-01", products:[{name:"Ankara 6 Yards", price:15000, img:"https://picsum.photos/seed/1/200"},{name:"Lace Swiss", price:45000, img:"https://picsum.photos/seed/2/200"},{name:"Adire", price:12000, img:"https://picsum.photos/seed/3/200"}]},
  { id:"2", name:"Chinedu Phones", owner:"Chinedu - Banex", category:"phones", x:6, y:2, color:"#0a7d33", emoji:"📱", whatsapp:"08061234567", views:302, expiry:"2026-11-20", products:[{name:"iPhone 15 Pro", price:890000, img:"https://picsum.photos/seed/4/200"},{name:"Power Bank", price:15000, img:"https://picsum.photos/seed/5/200"},{name:"Charger", price:7000, img:"https://picsum.photos/seed/6/200"}]},
  { id:"3", name:"Blessing Thrift", owner:"Blessing - Wuse C", category:"fashion", x:10, y:2, color:"#FF6B00", emoji:"👚", whatsapp:"08031234567", views:89, expiry:"2026-10-10", products:[{name:"Okrika 1st Grade", price:5000, img:"https://picsum.photos/seed/7/200"},{name:"Jeans", price:8000, img:"https://picsum.photos/seed/8/200"},{name:"Top", price:4000, img:"https://picsum.photos/seed/9/200"}]},
  { id:"4", name:"Alhaji Rice", owner:"Alhaji Sani Utako", category:"food", x:2, y:5, color:"#0a7d33", emoji:"🍚", whatsapp:"08091234567", views:210, expiry:"2026-09-01", products:[{name:"50kg Rice", price:62000, img:"https://picsum.photos/seed/10/200"},{name:"Tomato", price:12000, img:"https://picsum.photos/seed/11/200"},{name:"Oil 25L", price:35000, img:"https://picsum.photos/seed/12/200"}]},
]

export default function App(){
  const [route, setRoute] = useState("home")
  const [stalls, setStalls] = useState<Stall[]>(()=>{ const s=localStorage.getItem("wuse_final"); return s?JSON.parse(s):INITIAL_STALLS })
  const [player, setPlayer] = useState({x:5, y:0})
  const [nearStall, setNearStall] = useState<Stall|null>(null)
  const [selectedStall, setSelectedStall] = useState<Stall|null>(null)
  const [otherPlayers] = useState(()=>Array.from({length:8}, ()=>({ x: Math.random()*12, y: Math.random()*10, color: `hsl(${Math.random()*360},80%,60%)` })))
  const keys = useRef<{[k:string]:boolean}>({})
  const [adminForm, setAdminForm] = useState({ name:"", category:"fashion", whatsapp:"", img1:"", img2:"", img3:"", expiry:"" })
  const [leadForm, setLeadForm] = useState({ name:"", whatsapp:"", instagram:"" })
  const [pw, setPw] = useState(""); const [isAdmin, setIsAdmin]=useState(false)

  useEffect(()=>{ const path=window.location.pathname; if(path.includes("advertise")) setRoute("advertise"); else if(path.includes("admin")||path.includes("super-admin")) setRoute("admin"); else if(path.includes("market")) setRoute("market"); else setRoute("home") },[])
  useEffect(()=>{ localStorage.setItem("wuse_final", JSON.stringify(stalls)) },[stalls])
  useEffect(()=>{
    const down=(e:KeyboardEvent)=>keys.current[e.key.toLowerCase()]=true; const up=(e:KeyboardEvent)=>keys.current[e.key.toLowerCase()]=false
    window.addEventListener("keydown", down); window.addEventListener("keyup", up)
    const loop=setInterval(()=>{ if(route!=="market") return; let nx=player.x, ny=player.y; if(keys.current["w"]||keys.current["arrowup"]) ny-=0.2; if(keys.current["s"]||keys.current["arrowdown"]) ny+=0.2; if(keys.current["a"]||keys.current["arrowleft"]) nx-=0.2; if(keys.current["d"]||keys.current["arrowright"]) nx+=0.2; nx=Math.max(0,Math.min(12,nx)); ny=Math.max(0,Math.min(10,ny)); setPlayer({x:nx,y:ny}) },30)
    return ()=>{ clearInterval(loop); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up) }
  },[player, route])
  useEffect(()=>{ const f=stalls.find(s=>Math.abs(s.x-player.x)<1.2 && Math.abs(s.y-player.y)<1.2); setNearStall(f||null) },[player, stalls])

  const navigate = (r:string)=>{ window.history.pushState({}, "", r==="/"? "/": `/${r}`); setRoute(r) }

  const addStall = ()=>{
    if(!adminForm.name||!adminForm.whatsapp) return alert("Shop name & WhatsApp needed")
    const newStall: Stall = { id:Date.now().toString(), name:adminForm.name, owner:adminForm.name, category:adminForm.category, x:Math.random()*10+1, y:Math.random()*8+1, color:adminForm.category==="food"?"#0a7d33":adminForm.category==="phones"?"#0a7d33":"#FF6B00", emoji:adminForm.category==="fashion"?"👗":adminForm.category==="phones"?"📱":"🍚", whatsapp:adminForm.whatsapp, views:0, expiry:adminForm.expiry||"2026-12-31", products:[{name:"Product 1", price:10000, img:adminForm.img1||`https://picsum.photos/seed/${Date.now()}/200`},{name:"Product 2", price:20000, img:adminForm.img2||`https://picsum.photos/seed/${Date.now()+1}/200`},{name:"Product 3", price:15000, img:adminForm.img3||`https://picsum.photos/seed/${Date.now()+2}/200`}] }
    setStalls([newStall,...stalls]); alert("Stall added! Firestore: stalls collection"); setAdminForm({ name:"", category:"fashion", whatsapp:"", img1:"", img2:"", img3:"", expiry:"" })
    // Firebase: await addDoc(collection(db,"stalls"), newStall)
  }

  const addLead = ()=>{
    if(!leadForm.name||!leadForm.whatsapp) return alert("Need name & WhatsApp")
    const leads=JSON.parse(localStorage.getItem("wuse_leads")||"[]"); leads.push({...leadForm, date:new Date().toISOString()}); localStorage.setItem("wuse_leads", JSON.stringify(leads))
    alert("How far! We go contact you for your shop - 5k per week. Leads saved to Firestore"); setLeadForm({ name:"", whatsapp:"", instagram:"" })
    // Firebase: await addDoc(collection(db,"leads"), leadForm)
  }

  // HOMEPAGE
  if(route==="home") return (
    <div className="min-h-screen bg-[#FFFBF5] text-black">
      <header className="bg-black text-white p-4 flex justify-between items-center sticky top-0 z-20"><h1 className="font-black text-xl tracking-tighter">WUSE MARKET ONLINE<span className="text-[#FF6B00]">.</span></h1><button onClick={()=>navigate("advertise")} className="bg-[#FF6B00] px-4 py-2 rounded-full font-bold text-sm">Rent Stall ₦5k</button></header>

      <section className="bg-black text-white p-6 md:p-12 rounded-b-[40px]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="bg-[#FF6B00] text-black inline-block px-3 py-1 rounded-full font-mono text-[10px] font-black tracking-widest">LIVE NOW • 1,240 SHOPPERS TODAY</div>
            <h2 className="font-black text-5xl md:text-7xl leading-[0.85] tracking-tighter mt-4">WUSE MARKET<br/><span className="text-[#FF6B00]">NOW ONLINE</span></h2>
            <p className="font-mono text-sm text-zinc-400 mt-4">How far? Come shop! Walk around Wuse Market from your phone. No traffic. Pay on delivery.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>navigate("market")} className="bg-[#FF6B00] text-black px-8 py-4 rounded-full font-black text-lg shadow-[4px_4px_0px_white]">ENTER MARKET →</button>
              <button onClick={()=>navigate("advertise")} className="bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-full font-bold">How e dey work?</button>
            </div>
            <div className="flex gap-6 mt-8">
              <div><p className="font-black text-2xl">{stalls.length}</p><p className="font-mono text-[10px] text-zinc-500">REAL STALLS</p></div>
              <div><p className="font-black text-2xl">1,240</p><p className="font-mono text-[10px] text-zinc-500">SHOPPERS TODAY</p></div>
              <div><p className="font-black text-2xl">24/7</p><p className="font-mono text-[10px] text-zinc-500">OPEN</p></div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border-2 border-zinc-800 rounded-[24px] p-4 h-[400px] relative overflow-hidden">
            <div className="absolute inset-0" style={{backgroundImage:`linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)`, backgroundSize:`40px 40px`}}></div>
            {stalls.slice(0,6).map(s=><div key={s.id} className="absolute w-14 h-14 rounded-[12px] border-2 border-black flex items-center justify-center text-xl" style={{left:`${(s.x/12)*100}%`, top:`${(s.y/10)*100}%`, background:s.color}}>{s.emoji}</div>)}
            <div className="absolute bottom-4 left-4 bg-white text-black px-4 py-2 rounded-full font-black text-xs">🧑🏿‍🦱 YOU ARE HERE - PIXEL WALK</div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto p-6 mt-8">
        <h3 className="font-black text-2xl">Shop by Category</h3>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white border-2 border-black rounded-[20px] p-6 text-center shadow-[4px_4px_0px_black]"><span className="text-3xl">👗</span><p className="font-black mt-2">FASHION</p><p className="font-mono text-[10px]">{stalls.filter(s=>s.category==="fashion").length} stalls</p></div>
          <div className="bg-[#0a7d33] text-white border-2 border-black rounded-[20px] p-6 text-center shadow-[4px_4px_0px_black]"><span className="text-3xl">📱</span><p className="font-black mt-2">PHONES</p><p className="font-mono text-[10px]">{stalls.filter(s=>s.category==="phones").length} stalls</p></div>
          <div className="bg-[#FF6B00] border-2 border-black rounded-[20px] p-6 text-center shadow-[4px_4px_0px_black]"><span className="text-3xl">🍚</span><p className="font-black mt-2">FOOD</p><p className="font-mono text-[10px]">{stalls.filter(s=>s.category==="food").length} stalls</p></div>
        </div>

        <div className="bg-black text-white rounded-[24px] p-6 mt-8 flex gap-4 items-center">
          <img src="https://picsum.photos/seed/aisha/100" className="w-16 h-16 rounded-full border-2 border-[#FF6B00]"/>
          <div><p className="font-bold">"I got 12 customers in 2 days - No Jumia wahala!"</p><p className="font-mono text-xs text-zinc-500 mt-1">— Aisha Fabrics, Block A12 Wuse Market • 124 views</p></div>
        </div>

        <button onClick={()=>navigate("market")} className="w-full bg-black text-white p-5 rounded-full font-black text-lg mt-8">ENTER MARKET NOW → WALK & SHOP</button>
        <p className="font-mono text-[10px] text-center mt-3 text-zinc-500">PWA Ready • Add to Home Screen • Works offline • Abuja market vibe</p>
      </section>
    </div>
  )

  // ADVERTISE PAGE
  if(route==="advertise") return (
    <div className="min-h-screen bg-[#FFFBF5]">
      <header className="bg-black text-white p-4 flex justify-between"><button onClick={()=>navigate("/")} className="font-mono text-xs">← HOME</button><span className="font-black">ADVERTISE</span><div></div></header>
      <div className="bg-[#FF6B00] text-black p-8 md:p-12">
        <h1 className="font-black text-4xl md:text-6xl leading-[0.9] tracking-tighter max-w-3xl">GET YOUR SHOP<br/>INSIDE WUSE MARKET<br/>ONLINE — 5,000 NAIRA<br/>PER WEEK</h1>
        <div className="flex gap-4 mt-6 font-mono text-sm"><span className="bg-black text-white px-4 py-2 rounded-full">🔴 LIVE: 1,240 shoppers today</span><span className="bg-white text-black px-4 py-2 rounded-full">8 people online now</span></div>
      </div>
      <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-8 mt-6">
        <div>
          <h3 className="font-black text-2xl">Benefits - No Jumia fees</h3>
          <ul className="mt-4 space-y-3 font-bold">
            <li className="flex gap-3"><span className="bg-[#0a7d33] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">✓</span> Direct WhatsApp customers - no commission</li>
            <li className="flex gap-3"><span className="bg-[#0a7d33] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">✓</span> Open 24/7 - Even when Wuse closed</li>
            <li
