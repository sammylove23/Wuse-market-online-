"use client"
import { useState } from "react"

type Stall = {
  id: string
  businessName: string
  category: string
  whatsapp: string
  views: number
  clicks: number
  rating: number
  verified: boolean
  featured: boolean
  rentExpiry: string
}

export default function SuperAdmin() {
  const REAL_PASSWORD = "Samuel239"
  const [password, setPassword] = useState("")
  const [isAuth, setIsAuth] = useState(false)
  const [search, setSearch] = useState("")
  const [newShop, setNewShop] = useState({ businessName: "", category: "Fashion", whatsapp: "", rentExpiry: "2027-05-20" })
  
  const [stalls, setStalls] = useState<Stall[]>([
    { id: "1", businessName: "Mama Nkechi Fabrics", category: "Fashion", whatsapp: "08031234567", views: 120, clicks: 12, rating: 4.5, verified: true, featured: true, rentExpiry: "2027-05-20" },
    { id: "2", businessName: "Uche Electronics", category: "Electronics", whatsapp: "08061234567", views: 89, clicks: 7, rating: 4.2, verified: false, featured: false, rentExpiry: "2027-05-20" },
  ])

  const login = () => {
    if (password === REAL_PASSWORD) setIsAuth(true)
    else alert("Incorrect password. Use Samuel239")
  }

  const filtered = stalls.filter(s => s.businessName.toLowerCase().includes(search.toLowerCase()) || s.whatsapp.includes(search))

  const createShop = () => {
    if(!newShop.businessName || !newShop.whatsapp) return alert("Enter name and WhatsApp")
    const shop: Stall = { id: Date.now().toString(), businessName: newShop.businessName, category: newShop.category, whatsapp: newShop.whatsapp, views: 0, clicks: 0, rating: 5, verified: true, featured: true, rentExpiry: newShop.rentExpiry }
    setStalls([shop, ...stalls])
    setNewShop({ businessName: "", category: "Fashion", whatsapp: "", rentExpiry: "2027-05-20" })
  }

  const toggleVerify = (id: string) => setStalls(stalls.map(s => s.id === id ? {...s, verified: !s.verified} : s))
  const toggleFeatured = (id: string) => setStalls(stalls.map(s => s.id === id ? {...s, featured: !s.featured} : s))
  const extendRent = (id: string) => setStalls(stalls.map(s => s.id === id ? {...s, rentExpiry: "2028-05-20"} : s))
  const deleteShop = (id: string) => { if(confirm("Delete?")) setStalls(stalls.filter(s => s.id !== id)) }

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-sm">
          <h1 className="text-white font-bold mb-4">SUPER ADMIN LOGIN</h1>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" className="w-full p-3 rounded bg-zinc-800 text-white mb-3"/>
          <button onClick={login} className="w-full bg-green-500 text-black font-bold p-3 rounded">LOGIN</button>
          <p className="text-zinc-500 text-xs mt-3">Password is Samuel239</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-1">WUSE MARKET CEO DASHBOARD</h1>
      <p className="text-zinc-500 text-sm mb-6">Total: {stalls.length} shops | Verified: {stalls.filter(s=>s.verified).length} | Pending: {stalls.filter(s=>!s.verified).length}</p>

      <div className="bg-zinc-900 p-4 rounded-xl mb-6">
        <h2 className="font-bold mb-3">+ CREATE NEW SHOP (for paying trader)</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input value={newShop.businessName} onChange={e=>setNewShop({...newShop, businessName:e.target.value})} placeholder="Business Name" className="p-3 rounded bg-zinc-800"/>
          <input value={newShop.category} onChange={e=>setNewShop({...newShop, category:e.target.value})} placeholder="Category" className="p-3 rounded bg-zinc-800"/>
          <input value={newShop.whatsapp} onChange={e=>setNewShop({...newShop, whatsapp:e.target.value})} placeholder="080..." className="p-3 rounded bg-zinc-800"/>
          <input type="date" value={newShop.rentExpiry} onChange={e=>setNewShop({...newShop, rentExpiry:e.target.value})} className="p-3 rounded bg-zinc-800"/>
          <button onClick={createShop} className="bg-green-500 text-black font-bold p-3 rounded">CREATE & APPROVE</button>
        </div>
      </div>

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or WhatsApp..." className="w-full p-3 rounded bg-zinc-900 mb-4"/>

      <div className="grid gap-3">
        {filtered.map(s => (
          <div key={s.id} className="bg-zinc-900 p-4 rounded-xl flex flex-col md:flex-row justify-between gap-3">
            <div>
              <p className="font-bold">{s.businessName} {s.verified ? "✅" : "⏳ PENDING"} {s.featured && "⭐"}</p>
              <p className="text-xs text-zinc-400">{s.category} | {s.whatsapp} | Views:{s.views} Clicks:{s.clicks} Rating:{s.rating} | Rent:{s.rentExpiry}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={()=>toggleVerify(s.id)} className={`px-3 py-2 rounded text-xs font-bold ${s.verified ? "bg-yellow-500 text-black" : "bg-green-500 text-black"}`}>{s.verified ? "Unverify" : "Approve"}</button>
              <button onClick={()=>toggleFeatured(s.id)} className="px-3 py-2 rounded bg-white text-black text-xs font-bold">{s.featured ? "Unfeature" : "Feature"}</button>
              <button onClick={()=>extendRent(s.id)} className="px-3 py-2 rounded bg-zinc-700 text-xs">+6 Months</button>
              <button onClick={()=>deleteShop(s.id)} className="px-3 py-2 rounded bg-red-600 text-xs font-bold">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
