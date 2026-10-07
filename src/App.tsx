import { useState, useEffect } from "react"

type Product = { id: string; name: string; price: number; stock: number; shop: string; market: string; category: string; whatsapp: string; image: string }
const MARKETS = ["All Markets","Wuse Market","Banex Plaza - Wuse 2","Utako Market","Garki Market","Kado Fish Market","Dei-Dei Market","Emab Plaza Wuse 2"]
const CATEGORIES = ["All","Fashion","Electronics","Phones","Laptops","Food","Building","Fish & Meat"]

export default function App() {
  const [page, setPage] = useState("market")
  const [selectedMarket, setSelectedMarket] = useState("All Markets")
  const [selectedCat, setSelectedCat] = useState("All")
  const [isAdmin, setIsAdmin] = useState(false)
  const [pw, setPw] = useState("")
  const [products, setProducts] = useState<Product[]>(()=>{
    const s=localStorage.getItem("abuja_all_markets"); if(s) return JSON.parse(s)
    return [
      {id:"1", name:"Ankara 6 Yards Original", price:15000, stock:40, shop:"Mama Nkechi Block A", market:"Wuse Market", category:"Fashion", whatsapp:"08031234567", image:"👗"},
      {id:"2", name:"iPhone 15 Pro Max 256GB", price:890000, stock:5, shop:"Chidi Gadgets Shop 12", market:"Banex Plaza - Wuse 2", category:"Phones", whatsapp:"08061234567", image:"📱"},
      {id:"3", name:"Mama Gold Rice 50kg", price:62000, stock:100, shop:"Alhaji Sani Grains", market:"Utako Market", category:"Food", whatsapp:"08091234567", image:"🍚"},
      {id:"4", name:"HP EliteBook Core i7", price:320000, stock:7, shop:"Slot Systems Banex", market:"Banex Plaza - Wuse 2", category:"Laptops", whatsapp:"08061234567", image:"💻"},
      {id:"5", name:"Fresh Catfish 1kg", price:3500, stock:200, shop:"Kado Fish Woman", market:"Kado Fish Market", category:"Fish & Meat", whatsapp:"08031234567", image:"🐟"},
      {id:"6", name:"Cement Dangote - 1 Bag", price:8500, stock:500, shop:"Dei-Dei Block 5", market:"Dei-Dei Market", category:"Building", whatsapp:"08091234567", image:"🏗️"},
      {id:"7", name:"Lace Material Swiss", price:45000, stock:15, shop:"Aunty Bisi Fabrics", market:"Garki Market", category:"Fashion", whatsapp:"08031234567", image:"👘"},
      {id:"8", name:"Phone Pouch & Charger", price:5000, stock:150, shop:"Emab Accessories", market:"Emab Plaza Wuse 2", category:"Electronics", whatsapp:"08061234567", image:"🔌"},
    ]
  })
  const [form, setForm] = useState({ name:"", price:"", stock:"", shop:"", market:"Wuse Market", category:"Fashion", whatsapp:"", image:"📦" })
  useEffect(()=>{localStorage.setItem("abuja_all_markets", JSON.stringify(products))},[products])
  useEffect(()=>{if(window.location.pathname==="/super-admin") setPage("admin")},[])

  const filtered = products.filter(p=>(selectedMarket==="All Markets"||p.market===selectedMarket)&&(selectedCat==="All"||p.category===selectedCat))
  const addProduct=()=>{
    if(!form.name||!form.price) return alert("Add name & price")
    setProducts([{id:Date.now().toString(), name:form.name, price:Number(form.price), stock:Number(form.stock)||0, shop:form.shop, market:form.market, category:form.category, whatsapp:form.whatsapp||"08000000000", image:form.image},...products])
    setForm({ name:"", price:"", stock:"", shop:"", market:"Wuse Market", category:"Fashion", whatsapp:"", image:"📦" }); alert("Added!"); setPage("market")
  }

  if(page==="admin"){
    if(!isAdmin) return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-sm border border-zinc-800"><h2 className="font-black text-xl">ABUJA MARKETS CEO</h2><p className="text-xs text-zinc-500 mb-4">Wuse • Banex • Utako • Garki • Kado • Dei-Dei • Emab</p><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" className="w-full p-3 rounded-xl bg-black border border-zinc-800 mb-4" /><button onClick={()=>{if(pw==="Samuel239") setIsAdmin(true); else alert("Wrong")}} className="w-full bg-green-500 text-black p-3 rounded-xl font-black">UNLOCK</button></div>
      </div>
    )
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <h1 className="font-black text-2xl">CEO DASHBOARD</h1><p className="text-zinc-500 text-sm">{products.length} products live across 7 markets</p>
        <div className="grid grid-cols-4 gap-2 mt-4">{MARKETS.slice(1).map(m=><div key={m} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800"><p className="text-[10px] text-zinc-500">{m}</p><p className="font-black">{products.filter(p=>p.market===m).length}</p></div>)}</div>
        <button onClick={addProduct} className="w-full mt-6 bg-zinc-900 border border-zinc-800 p-3 rounded-xl">Go to Add Inventory</button>
        <div className="mt-6"><h3 className="font-bold">All Products</h3>{products.map(p=><div key={p.id} className="flex justify-between py-2 border-b border-zinc-900 text-sm"><span>{p.name} ({p.market})</span><button onClick={()=>setProducts(products.filter(x=>x.id!==p.id))} className="text-red-500">Del</button></div>)}</div>
        <button onClick={()=>setPage("market")} className="mt-6 text-zinc-500">← Back to Market</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="p-3 border-b border-zinc-800 sticky top-0 bg-black z-10">
        <div className="flex justify-between items-center"><h1 className="font-black leading-none">ABUJA<span className="text-green-500">MARKETS</span><span className="block text-[9px] font-normal text-zinc-500 tracking-[2px]">7 MARKETS • 1 APP</span></h1><button onClick={()=>setPage("inventory")} className="bg-green-500 text-black px-4 py-2 rounded-full font-bold text-sm">+ Add</button></div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">{MARKETS.map(m=><button key={m} onClick={()=>setSelectedMarket(m)} className={`px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap border ${selectedMarket===m?"bg-white text-black":"bg-zinc-900 border-zinc-800 text-zinc-400"}`}>{m.replace(" - Wuse 2","")}</button>)}</div>
        <div className="flex gap-2 mt-2 overflow-x-auto">{CATEGORIES.map(c=><button key={c} onClick={()=>setSelectedCat(c)} className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap ${selectedCat===c?"bg-green-500 text-black":"bg-zinc-900 text-zinc-500"}`}>{c}</button>)}</div>
      </header>
      {page==="market" && <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3">{filtered.map(p=><div key={p.id} className="bg-zinc-900 rounded-xl p-3 border border-zinc-800"><div className="flex justify-between"><span className="text-xl">{p.image}</span><span className="text-[8px] bg-zinc-800 px-2 py-1 rounded-full">{p.market.split(" ")[0]}</span></div><h3 className="font-bold text-xs mt-2 line-clamp-2">{p.name}</h3><p className="text-[10px] text-zinc-500">{p.shop}</p><p className="text-green-500 font-black text-sm">₦{p.price.toLocaleString()}</p><a href={`https://wa.me/234${p.whatsapp.slice(1)}?text=Hi, I want ${p.name} from ${p.market}`} target="_blank" className="mt-2 block bg-white text-black text-center py-2 rounded-lg text-[11px] font-bold">WhatsApp • {p.market.includes("Banex")?"Banex":p.market.split(" ")[0]}</a></div>)}</div>}
      {page==="inventory" && <div className="p-4 max-w-lg mx-auto"><h2 className="font-black">Create New Inventory</h2><p className="text-xs text-zinc-500 mb-4">Add to any of 7 Abuja markets</p><div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3"><select value={form.market} onChange={e=>setForm({...form, market:e.target.value})} className="w-full p-3 rounded-xl bg-black border border-zinc-800">{MARKETS.slice(1).map(m=><option key={m}>{m}</option>)}</select><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Product Name" className="w-full p-3 rounded-xl bg-black border border-zinc-800" /><div className="grid grid-cols-2 gap-2"><input value={form.price} onChange={e=>setForm({...form, price:e.target.value})} placeholder="Price" type="number" className="w-full p-3 rounded-xl bg-black border border-zinc-800" /><input value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} placeholder="Stock" type="number" className="w-full p-3 rounded-xl bg-black border border-zinc-800" /></div><input value={form.shop} onChange={e=>setForm({...form, shop:e.target.value})} placeholder="Shop + Block" className="w-full p-3 rounded-xl bg-black border border-zinc-800" /><input value={form.whatsapp} onChange={e=>setForm({...form, whatsapp:e.target.value})} placeholder="WhatsApp 080..." className="w-full p-3 rounded-xl bg-black border border-zinc-800" /><button onClick={addProduct} className="w-full bg-green-500 text-black p-4 rounded-xl font-black">+ ADD TO {form.market.toUpperCase()}</button><button onClick={()=>setPage("market")} className="w-full text-zinc-500 text-sm">Cancel</button></div></div>}
    </div>
  )
}
