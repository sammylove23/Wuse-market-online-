import { useState, useEffect, useRef } from "react"
type Prod = { name: string; price: number; img: string }
type Stall = { id: string; name: string; owner: string; x: number; y: number; color: string; emoji: string; products: Prod[]; whatsapp: string; views: number }
const STALLS: Stall[] = [
  { id:"1", name:"Aisha Fabrics", owner:"Block A12", x:2, y:2, color:"#c17c4b", emoji:"👗", whatsapp:"08031234567", views:124, products:[{name:"Ankara 6 Yards", price:15000, img:"https://picsum.photos/200/200?1"},{name:"Lace", price:45000, img:"https://picsum.photos/200/200?2"},{name:"Adire", price:12000, img:"https://picsum.photos/200/200?3"}]},
  { id:"2", name:"Chinedu Phones", owner:"Banex Shop 7", x:6, y:2, color:"#2b5fff", emoji:"📱", whatsapp:"08061234567", views:302, products:[{name:"iPhone 15 Pro", price:890000, img:"https://picsum.photos/200/200?4"},{name:"Samsung S24", price:650000, img:"https://picsum.photos/200/200?5"},{name:"Power Bank", price:15000, img:"https://picsum.photos/200/200?6"}]},
  { id:"3", name:"Blessing Thrift", owner:"Block C", x:10, y:2, color:"#e3a008", emoji:"👚", whatsapp:"08031234567", views:89, products:[{name:"Okrika", price:5000, img:"https://picsum.photos/200/200?7"},{name:"Jeans", price:8000, img:"https://picsum.photos/200/200?8"},{name:"Top", price:4000, img:"https://picsum.photos/200/200?9"}]},
  { id:"4", name:"Alhaji Rice", owner:"Utako", x:2, y:5, color:"#1a8a4a", emoji:"🍚", whatsapp:"08091234567", views:210, products:[{name:"Mama Gold 50kg", price:62000, img:"https://picsum.photos/200/200?10"},{name:"Tomato", price:12000, img:"https://picsum.photos/200/200?11"},{name:"Oil 25L", price:35000, img:"https://picsum.photos/200/200?12"}]},
  { id:"5", name:"Kado Fish", owner:"Iya Kado", x:6, y:5, color:"#0e7490", emoji:"🐟", whatsapp:"08031234567", views:95, products:[{name:"Catfish", price:3500, img:"https://picsum.photos/200/200?13"},{name:"Tilapia", price:4000, img:"https://picsum.photos/200/200?14"},{name:"Smoked", price:5000, img:"https://picsum.photos/200/200?15"}]},
  { id:"6", name:"Emab Gadgets", owner:"Emab", x:10, y:5, color:"#7c3aed", emoji:"💻", whatsapp:"08061234567", views:180, products:[{name:"HP Laptop", price:320000, img:"https://picsum.photos/200/200?16"},{name:"Mouse", price:5000, img:"https://picsum.photos/200/200?17"},{name:"Charger", price:7000, img:"https://picsum.photos/200/200?18"}]},
]

export default function App(){
  const [player,setPlayer]=useState({x:5,y:0})
  const [near,setNear]=useState<Stall|null>(null)
  const [sel,setSel]=useState<Stall|null>(null)
  const [stalls,setStalls]=useState<Stall[]>(()=>{
    const s=localStorage.getItem("wuse_pixel"); return s?JSON.parse(s):STALLS
  })
  const keys=useRef<{[k:string]:boolean}>({})
  const other=[{x:1,y:1,c:"#ff0"},{x:8,y:3,c:"#0ff"},{x:3,y:7,c:"#f0f"},{x:9,y:8,c:"#0f0"}]

  useEffect(()=>{localStorage.setItem("wuse_pixel",JSON.stringify(stalls))},[stalls])
  useEffect(()=>{
    const d=(e:KeyboardEvent)=>keys.current[e.key.toLowerCase()]=true
    const u=(e:KeyboardEvent)=>keys.current[e.key.toLowerCase()]=false
    window.addEventListener("keydown",d); window.addEventListener("keyup",u)
    const id=setInterval(()=>{
      let nx=player.x, ny=player.y
      if(keys.current["w"]||keys.current["arrowup"]) ny-=0.2
      if(keys.current["s"]||keys.current["arrowdown"]) ny+=0.2
      if(keys.current["a"]||keys.current["arrowleft"]) nx-=0.2
      if(keys.current["d"]||keys.current["arrowright"]) nx+=0.2
      nx=Math.max(0,Math.min(12,nx)); ny=Math.max(0,Math.min(10,ny))
      setPlayer({x:nx,y:ny})
    },30)
    return ()=>{clearInterval(id); window.removeEventListener("keydown",d); window.removeEventListener("keyup",u)}
  },[player])

  useEffect(()=>{ setNear(stalls.find(s=>Math.abs(s.x-player.x)<1.2&&Math.abs(s.y-player.y)<1.2)||null) },[player,stalls])

  return (
    <div className="h-[100dvh] bg-black text-white flex flex-col overflow-hidden">
      <div className="bg-zinc-900 border-b border-zinc-800 p-3 flex justify-between"><h1 className="font-black">WUSE MARKET ONLINE<span className="text-zinc-500">.PIXEL</span></h1><span className="text-[10px] font-mono bg-green-500/20 text-green-400 px-2 py-1 rounded-full">{stalls.length} STALLS</span></div>
      <div className="flex-1 relative bg-[#121212] overflow-hidden">
        <div className="absolute inset-0" style={{backgroundImage:"linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)", backgroundSize:"60px 60px"}}></div>
        {stalls.map(s=><div key={s.id} onClick={()=>{setSel(s); setStalls(p=>p.map(x=>x.id===s.id?{...x,views:x.views+1}:x))}} className="absolute" style={{left:`${(s.x/12)*100}%`, top:`${(s.y/10)*100}%`}}><div className="w-[70px] h-[70px] rounded-[12px] border-[3px] border-black flex flex-col items-center justify-center" style={{background:s.color}}><span className="text-2xl">{s.emoji}</span><span className="font-black text-[7px] text-black text-center">{s.name}</span></div><div className="bg-black text-white text-[8px] text-center rounded-full mt-1">{s.views} views</div></div>)}
        {other.map((o,i)=><div key={i} className="absolute w-3 h-3 rounded-full border-2 border-black" style={{left:`${(o.x/12)*100}%`, top:`${(o.y/10)*100}%`, background:o.c}}></div>)}
        <div className="absolute w-8 h-8 z-10" style={{left:`calc(${(player.x/12)*100}% - 16px)`, top:`calc(${(player.y/10)*100}% - 16px)`}}><div className="w-8 h-8 bg-white border-[3px] border-black rounded-full flex items-center justify-center">🧑🏿‍🦱</div></div>
        {near&&!sel&&<div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full font-black animate-bounce cursor-pointer" onClick={()=>{setSel(near); setStalls(p=>p.map(x=>x.id===near.id?{...x,views:x.views+1}:x))}}>SHOP {near.name.toUpperCase()} →</div>}
        <div className="absolute bottom-6 left-6 md:hidden"><div className="w-[120px] h-[120px] bg-white/10 border border-white/20 rounded-full flex items-center justify-center"><div className="grid grid-cols-3 gap-1"><div></div><button onTouchStart={()=>setPlayer(p=>({...p,y:Math.max(0,p.y-0.5)}))} className="w-10 h-10 bg-white text-black rounded-full">↑</button><div></div><button onTouchStart={()=>setPlayer(p=>({...p,x:Math.max(0,p.x-0.5)}))} className="w-10 h-10 bg-white text-black rounded-full">←</button><div className="w-10 h-10 bg-black rounded-full"></div><button onTouchStart={()=>setPlayer(p=>({...p,x:Math.min(12,p.x+0.5)}))} className="w-10 h-10 bg-white text-black rounded-full">→</button><div></div><button onTouchStart={()=>setPlayer(p=>({...p,y:Math.min(10,p.y+0.5)}))} className="w-10 h-10 bg-white text-black rounded-full">↓</button><div></div></div></div></div>
      </div>
      {sel&&<div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"><div className="bg-white text-black w-full md:max-w-lg rounded-t-[28px] md:rounded-[28px] overflow-hidden"><div className="p-6" style={{background:sel.color}}><div className="flex justify-between"><div className="flex gap-4"><div className="w-14 h-14 bg-black rounded-[16px] flex items-center justify-center text-2xl">{sel.emoji}</div><div><h2 className="font-black text-xl">{sel.name.toUpperCase()}</h2><p className="font-mono text-xs">{sel.owner} • {sel.views} visits</p></div></div><button onClick={()=>setSel(null)} className="bg-black text-white w-10 h-10 rounded-full">×</button></div></div><div className="p-4 space-y-3">{sel.products.map((pr,i)=><div key={i} className="flex gap-3 border-2 border-black rounded-[16px] p-3"><img src={pr.img} className="w-20 h-20 rounded-[12px] object-cover border-2 border-black"/><div><p className="font-bold text-sm">{pr.name}</p><p className="font-black">₦{pr.price.toLocaleString()}</p></div></div>)}</div><div className="p-4"><a href={`https://wa.me/234${sel.whatsapp.slice(1)}?text=Hi ${sel.name}, I saw you on WUSE PIXEL MAP`} target="_blank" className="w-full bg-[#25D366] text-black p-4 rounded-full font-black block text-center">💬 CHAT ON WHATSAPP →</a></div></div></div>}
    </div>
  )
}
