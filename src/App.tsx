import { useState, useEffect } from "react"
type Product = { id: string; name: string; price: number; stock: number; shop: string; market: string; whatsapp: string; emoji: string }
const MARKETS = [
  { name: "All Markets", color: "bg-black", dot: "⚫" },
  { name: "Wuse Market", color: "bg-[#c17c4b]", dot: "🟤" },
  { name: "Banex Plaza", color: "bg-[#2b5fff]", dot: "🔵" },
  { name: "Utako Market", color: "bg-[#1a8a4a]", dot: "🟢" },
  { name: "Garki Market", color: "bg-[#e3a008]", dot: "🟡" },
  { name: "Kado Fish", color: "bg-[#0e7490]", dot: "🔷" },
  { name: "Dei-Dei Market", color: "bg-[#57534e]", dot: "⬛" },
  { name: "Emab Plaza", color: "bg-[#7c3aed]", dot: "🟣" },
]
export default function App(){
  const [market,setMarket]=useState("All Markets")
  const [page,setPage]=useState("market")
  const [isAdmin,setIsAdmin]=useState(false)
  const [pw,setPw]=useState("")
  const [products,setProducts]=useState<Product[]>(()=>{
    const s=localStorage.getItem("abuja_unique"); if(s) return JSON.parse(s)
    return [
      { id:"1", name:"Ankara 6 Yards", price:15000, stock:12, shop:"Mama Nkechi Block A12", market:"Wuse Market", whatsapp:"08031234567", emoji:"🦺" },
      { id:"2", name:"iPhone 15 Pro Max", price:890000, stock:3, shop:"Chidi - Shop 7 Banex", market:"Banex Plaza", whatsapp:"08061234567", emoji:"📱" },
    ]
  })
  const [form,setForm]=useState({ name:"", price:"", stock:"", shop:"", market:"Wuse Market", whatsapp:"", emoji:"📦" })
  useEffect(()=>{localStorage.setItem("abuja_unique",JSON.stringify(products))},[products])
  useEffect(()=>{ if(window.location.pathname.includes("super-admin")) setPage("admin") },[])

  const activeColor = MARKETS.find(m=>m.name===market)?.color || "bg-black"
  const filtered = products.filter(p=>market==="All Markets"||p.market===market)
  const add=()=>{ if(!form.name||!form.price) return alert("Need name & price"); setProducts([{ id:Date.now().toString(), name:form.name, price:Number(form.price), stock:Number(form.stock)||5, shop:form.shop, market:form.market, whatsapp:form.whatsapp||"08000000000", emoji:form.emoji||"📦" },...products]); setPage("market") }

  if(page==="admin"){
    if(!isAdmin) return <div className="min-h-screen bg-[#faf6f1] flex items-center justify-center p-6"><div className="bg-white border-[3px] border-black rounded-[24px] p-8 shadow-[8px_8px_0px_black] w-full max-w-sm"><h1 className="font-black text-2xl">CEO LOGIN</h1><p className="font-mono text-[10px] mt-1">ABUJA MARKETS SUPER ADMIN</p><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" className="w-full border-[2px] border-black p-4 rounded-full mt-6 font-bold"/><button onClick={()=>pw==="Samuel239"?setIsAdmin(true):alert("Wrong password")} className="w-full bg-black text-white p-4 rounded-full font-black mt-3">UNLOCK</button></div></div>
    return <div className="min-h-screen bg-[#faf6f1] p-6"><h1 className="font-black text-3xl">CEO DASHBOARD</h1><p className="font-mono">{products.length} products across 7 markets</p><div className="bg-white border-[3px] border-black rounded-[24px] p-4 mt-6">{products.map(p=><div key={p.id} className="flex justify-between py-2 border-b text-sm"><span>{p.name} - {p.market}</span><button onClick={()=>setProducts(products.filter(x=>x.id!==p.id))} className="text-red-600 font-bold">Delete</button></div>)}</div><button onClick={()=>setPage("market")} className="mt-6 underline font-mono">← Back to Market</button></div>
  }

  return (
    <div className="min-h-screen bg-[#faf6f1] text-black">
      <div className="sticky top-0 z-20">
        <div className="bg-black text-[#faf6f1] text-[10px] tracking-[4px] py-2 text-center font-mono">ABUJA • WUSE • BANEX • UTAKO • GARKI • KADO • DEI-DEI • EMAB</div>
        <header className={`${activeColor} transition-colors duration-500 text-white p-4 md:p-6 rounded-b-[30px]`}>
          <div className="flex justify-between items-start max-w-7xl mx-auto">
            <div><h1 className="font-black text-3xl md:text-5xl tracking-tighter leading-[0.9]">ABUJA<br/>MARKETS<span className="font-light">.</span></h1><p className="font-mono text-[11px] mt-2 opacity-80">EST. 2026 — 7 MARKETS ONE APP</p></div>
            <button onClick={()=>setPage(page==="inventory"?"market":"inventory")} className="bg-white text-black w-12 h-12 rounded-full font-black text-2xl flex items-center justify-center shadow-[4px_4px_0px_black]">{page==="inventory"?"×":"+"}</button>
          </div>
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2 max-w-7xl mx-auto">{MARKETS.map(m=><button key={m.name} onClick={()=>setMarket(m.name)} className={`px-5 py-3 rounded-full font-bold text-sm whitespace-nowrap border-2 border-black shadow-[3px_3px_0px_black] ${market===m.name?"bg-white text-black -translate-y-1":"bg-black/20 text-white"}`}><span className="mr-2">{m.dot}</span>{m.name.toUpperCase()}</button>)}</div>
        </header>
      </div>
      <main className="max-w-7xl mx-auto p-3 md:p-6">
        <h2 className="font-black text-2xl md:text-4xl tracking-tight mt-4">{market.toUpperCase()} <span className="text-[#c17c4b]">/</span> <span className="font-light text-xl">{filtered.length} SHOPS</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {filtered.map(p=>{
            const mColor = MARKETS.find(m=>p.market.includes(m.name.split(" ")[0]))?.color || "bg-zinc-200"
            return <div key={p.id} className="bg-white border-[3px] border-black rounded-[24px] overflow-hidden shadow-[6px_6px_0px_black]"><div className={`h-3 ${mColor}`}></div><div className="p-5"><div className="flex justify-between"><div className="w-16 h-16 bg-[#faf6f1] border-2 border-black rounded-[16px] flex items-center justify-center text-3xl">{p.emoji}</div><p className="font-mono text-[10px] bg-black text-white px-2 py-1 rounded-full h-fit">{p.market.toUpperCase()}</p></div><h3 className="font-black text-xl mt-4 uppercase">{p.name}</h3><p className="font-mono text-[11px] text-zinc-500">{p.shop} • {p.stock} left</p><div className="flex justify-between items-end mt-5"><p className="font-black text-2xl">₦{p.price.toLocaleString()}</p><a href={`https://wa.me/234${p.whatsapp.slice(1)}?text=Hi - ${p.name} at ${p.market}`} target="_blank" className="bg-black text-white px-5 py-2.5 rounded-full font-bold text-sm">BUY →</a></div></div></div>
          })}
        </div>
      </main>
      {page==="inventory"&&<div className="fixed inset-0 bg-[#faf6f1] z-50 p-4 overflow-y-auto"><div className="max-w-lg mx-auto"><div className="flex justify-between"><h2 className="font-black text-3xl">ADD SHOP.</h2><button onClick={()=>setPage("market")} className="bg-black text-white w-12 h-12 rounded-full text-2xl">×</button></div><div className="bg-white border-[3px] border-black rounded-[24px] p-6 mt-6 shadow-[8px_8px_0px_black] space-y-4"><select value={form.market} onChange={e=>setForm({...form,market:e.target.value})} className="w-full border-[2px] border-black p-4 rounded-full font-bold">{MARKETS.slice(1).map(m=><option key={m.name}>{m.name}</option>)}</select><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="PRODUCT NAME" className="w-full border-[2px] border-black p-4 rounded-full font-bold"/><div className="grid grid-cols-2 gap-3"><input value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="PRICE" type="number" className="w-full border-[2px] border-black p-4 rounded-full font-bold"/><input value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} placeholder="STOCK" type="number" className="w-full border-[2px] border-black p-4 rounded-full font-bold"/></div><input value={form.shop} onChange={e=>setForm({...form,shop:e.target.value})} placeholder="SHOP + BLOCK" className="w-full border-[2px] border-black p-4 rounded-full"/><input value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} placeholder="WHATSAPP" className="w-full border-[2px] border-black p-4 rounded-full"/><input value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})} placeholder="EMOJI" className="w-full border-[2px] border-black p-4 rounded-full"/><button onClick={add} className="w-full bg-black text-white p-4 rounded-full font-black">+ ADD TO {form.market.toUpperCase()}</button></div></div></div>}
    </div>
  )
}
