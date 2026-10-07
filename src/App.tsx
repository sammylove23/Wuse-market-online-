import { useState, useEffect } from "react"

type Product = { id: string; name: string; price: number; stock: number; shop: string; market: string; category: string; whatsapp: string; emoji: string }
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
  const [market, setMarket] = useState("All Markets")
  const [page, setPage] = useState("market")
  const [products, setProducts] = useState<Product[]>(()=>{
    const s = localStorage.getItem("abuja_unique"); if(s) return JSON.parse(s)
    return [
      { id:"1", name:"Ankara 6 Yards", price:15000, stock:12, shop:"Mama Nkechi Block A12", market:"Wuse Market", category:"Fabric", whatsapp:"08031234567", emoji:"🦺" },
      { id:"2", name:"iPhone 15 Pro Max", price:890000, stock:3, shop:"Chidi - Shop 7 Banex", market:"Banex Plaza", category:"Tech", whatsapp:"08061234567", emoji:"📱" },
      { id:"3", name:"50kg Rice Wholesale", price:62000, stock:60, shop:"Alhaji Sani Utako", market:"Utako Market", category:"Food", whatsapp:"08091234567", emoji:"🍚" },
      { id:"4", name:"Fresh Catfish Basket", price:12000, stock:25, shop:"Iya Kado Fish", market:"Kado Fish", category:"Food", whatsapp:"08031234567", emoji:"🐟" },
    ]
  })
  const [form, setForm] = useState({ name:"", price:"", stock:"", shop:"", market:"Wuse Market", whatsapp:"", emoji:"📦" })

  useEffect(()=>{localStorage.setItem("abuja_unique", JSON.stringify(products))},[products])
  const activeColor = MARKETS.find(m=>m.name===market)?.color || "bg-black"
  const filtered = products.filter(p=>market==="All Markets"||p.market===market)

  const add = ()=>{
    if(!form.name||!form.price) return alert("Need name & price")
    setProducts([{ id:Date.now().toString(), name:form.name, price:Number(form.price), stock:Number(form.stock)||5, shop:form.shop, market:form.market, category:"General", whatsapp:form.whatsapp||"08000000000", emoji:form.emoji||"📦" },...products])
    setPage("market")
  }

  return (
    <div className="min-h-screen bg-[#faf6f1] text-black selection:bg-black selection:text-white">
      {/* UNIQUE HEADER - Like Market Entrance Gate */}
      <div className="sticky top-0 z-20">
        <div className="bg-black text-[#faf6f1] text-[10px] tracking-[4px] py-2 text-center font-mono">ABUJA • WUSE • BANEX • UTAKO • GARKI • KADO • DEI-DEI • EMAB</div>
        <header className={`${activeColor} transition-colors duration-500 text-white p-4 md:p-6 rounded-b-[30px]`}>
          <div className="flex justify-between items-start max-w-7xl mx-auto">
            <div>
              <h1 className="font-black text-3xl md:text-5xl tracking-tighter leading-[0.9]">ABUJA<br/>MARKETS<span className="font-light">.</span></h1>
              <p className="font-mono text-[11px] mt-2 opacity-80">EST. 2026 — WUSE 2 / UTAKO / GARKI / KADO / DEI-DEI</p>
            </div>
            <button onClick={()=>setPage(page==="inventory"?"market":"inventory")} className="bg-white text-black w-12 h-12 md:w-14 md:h-14 rounded-full font-black text-2xl flex items-center justify-center shadow-[4px_4px_0px_black] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
              {page==="inventory"?"×":"+"}
            </button>
          </div>
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2 max-w-7xl mx-auto scrollbar-none">
            {MARKETS.map(m=>(
              <button key={m.name} onClick={()=>setMarket(m.name)} className={`px-5 py-3 rounded-full font-bold text-sm whitespace-nowrap border-2 border-black shadow-[3px_3px_0px_black] transition-all ${market===m.name?"bg-white text-black -translate-y-1 shadow-[4px_4px_0px_black]":"bg-black/20 text-white hover:bg-black/30"}`}>
                <span className="mr-2">{m.dot}</span>{m.name.toUpperCase()}
              </button>
            ))}
          </div>
        </header>
      </div>

      <main className="max-w-7xl mx-auto p-3 md:p-6">
        <div className="flex justify-between items-end mb-6 mt-2">
          <h2 className="font-black text-2xl md:text-4xl tracking-tight">{market.toUpperCase()} <span className="text-[#c17c4b]">/</span> <span className="font-light text-xl">{filtered.length} SHOPS</span></h2>
          <p className="font-mono text-[10px] text-right">PAY ON DELIVERY<br/>ABUJA ONLY</p>
        </div>

        {/* UNIQUE BLOCK CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {filtered.map(p=>{
            const mColor = MARKETS.find(m=>p.market.includes(m.name.split(" ")[0]))?.color || "bg-zinc-200"
            return (
              <div key={p.id} className="group bg-white border-[3px] border-black rounded-[24px] overflow-hidden shadow-[6px_6px_0px_black] hover:shadow-[8px_8px_0px_black] hover:-translate-y-1 transition-all">
                <div className={`h-3 ${mColor}`}></div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-[#faf6f1] border-2 border-black rounded-[16px] flex items-center justify-center text-3xl">{p.emoji}</div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] bg-black text-white px-2 py-1 rounded-full">{p.market.toUpperCase()}</p>
                      <p className="font-mono text-[10px] mt-1">{p.stock} LEFT</p>
                    </div>
                  </div>
                  <h3 className="font-black text-xl mt-4 leading-tight uppercase tracking-tight">{p.name}</h3>
                  <p className="font-mono text-[11px] mt-1 text-zinc-500">{p.shop}</p>
                  <div className="flex justify-between items-end mt-5">
                    <p className="font-black text-2xl">₦{p.price.toLocaleString()}</p>
                    <a href={`https://wa.me/234${p.whatsapp.slice(1)}?text=Hi from Abuja Markets - I want ${p.name} at ${p.market}`} target="_blank" className="bg-black text-white px-5 py-2.5 rounded-full font-bold text-sm">BUY →</a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length===0 && <div className="border-[3px] border-black border-dashed rounded-[24px] p-12 text-center mt-10"><p className="font-black text-2xl">NO SHOPS YET IN {market.toUpperCase()}</p><p className="font-mono text-sm mt-2">Be first to add inventory — click +</p></div>}
      </main>

      {page==="inventory"&&(
        <div className="fixed inset-0 bg-[#faf6f1] z-50 overflow-y-auto p-4">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-between items-center"><h2 className="font-black text-3xl tracking-tight">ADD<br/>SHOP.</h2><button onClick={()=>setPage("market")} className="bg-black text-white w-12 h-12 rounded-full text-2xl">×</button></div>
            <div className="bg-white border-[3px] border-black rounded-[24px] p-6 mt-6 shadow-[8px_8px_0px_black] space-y-4">
              <select value={form.market} onChange={e=>setForm({...form, market:e.target.value})} className="w-full border-[2px] border-black p-4 rounded-full font-bold">{MARKETS.slice(1).map(m=><option key={m.name}>{m.name}</option>)}</select>
              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="PRODUCT NAME (e.g. Ankara)" className="w-full border-[2px] border-black p-4 rounded-full font-bold placeholder:font-normal"/>
              <div className="grid grid-cols-2 gap-3"><input value={form.price} onChange={e=>setForm({...form, price:e.target.value})} placeholder="PRICE ₦" type="number" className="w-full border-[2px] border-black p-4 rounded-full font-bold"/><input value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} placeholder="STOCK" type="number" className="w-full border-[2px] border-black p-4 rounded-full font-bold"/></div>
              <input value={form.shop} onChange={e=>setForm({...form, shop:e.target.value})} placeholder="SHOP NAME + BLOCK (e.g. Shop 12 Block A)" className="w-full border-[2px] border-black p-4 rounded-full"/>
              <input value={form.whatsapp} onChange={e=>setForm({...form, whatsapp:e.target.value})} placeholder="WHATSAPP 080..." className="w-full border-[2px] border-black p-4 rounded-full"/>
              <input value={form.emoji} onChange={e=>setForm({...form, emoji:e.target.value})} placeholder="EMOJI FOR PRODUCT (e.g. 👗 📱 🐟)" className="w-full border-[2px] border-black p-4 rounded-full"/>
              <button onClick={add} className="w-full bg-black text-white p-4 rounded-full font-black text-lg shadow-[4px_4px_0px_#c17c4b]">+ ADD TO {form.market.toUpperCase()}</button>
              <p className="font-mono text-[10px] text-center">UNIQUE ABUJA DESIGN • NO JUMIA • NO COPY</p>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-16 bg-black text-[#faf6f1] p-6 rounded-t-[30px] text-center font-mono text-[10px] tracking-widest">BUILT IN WUSE 2 • FOR ABUJA TRADERS • 2026</footer>
    </div>
  )
}
