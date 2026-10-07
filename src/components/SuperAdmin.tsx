"use client"
import { useState, useEffect } from "react"

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
  const [stalls, setStalls] = useState<Stall[]>([
    { id: "1", businessName: "Mama Nkechi Fabrics", category: "Fashion", whatsapp: "0803...", views: 120, clicks: 12, rating: 4.5, verified: true, featured: false, rentExpiry: "2027-05-20" },
    { id: "2", businessName: "Uche Electronics", category: "Electronics", whatsapp: "0806...", views: 89, clicks: 7, rating: 4.2, verified: false, featured: false, rentExpiry: "2027-05-20" }
  ])
  const [newShop, setNewShop] = useState({ businessName: "", category: "", whatsapp: "" })

  const toggleVerify = (id: string) => {
    setStalls(stalls.map(s => s.id === id ? { ...s, verified: !s.verified } : s))
  }
  const toggleFeatured = (id: string) => {
    setStalls(stalls.map(s => s.id === id ? { ...s, featured: !s.featured } : s))
  }
  const deleteShop = (id: string) => {
    if(confirm("Delete this shop?")) setStalls(stalls.filter(s => s.id !== id))
  }
  const createShop = () => {
    if(!newShop.businessName) return alert("Enter shop name")
    setStalls([...stalls, { id: Date.now().toString(), businessName: newShop.businessName, category: newShop.category, whatsapp: newShop.whatsapp, views: 0, clicks: 0, rating: 5.0, verified: true, featured: true, rentExpiry: "2027-05-20" }])
    setNewShop({ businessName: "", category: "", whatsapp: "" })
    alert("Shop Created & Featured!")
  }

  return (
    <div className="p-4 md:p-8 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">WUSE MARKET SUPER ADMIN</h1>
      
      {/* CREATE SHOP */}
      <div className="bg-zinc-900 p-4 rounded-xl mb-8">
        <h2 className="font-bold mb-3">+ Create New Shop (for paying traders)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={newShop.businessName} onChange={e=>setNewShop({...newShop, businessName: e.target.value})} placeholder="Business Name" className="p-3 rounded bg-zinc-800"/>
          <input value={newShop.category} onChange={e=>setNewShop({...newShop, category: e.target.value})} placeholder="Category e.g Fashion" className="p-3 rounded bg-zinc-800"/>
          <input value={newShop.whatsapp} onChange={e=>setNewShop({...newShop, whatsapp: e.target.value})} placeholder="WhatsApp 080..." className="p-3 rounded bg-zinc-800"/>
          <button onClick={createShop} className="bg-green-500 text-black font-bold p-3 rounded">CREATE & VERIFY</button>
        </div>
      </div>

      {/* STALL LIST */}
      <div className="grid gap-4">
        {stalls.map(stall => (
          <div key={stall.id} className="bg-zinc-900 p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p className="font-bold text-lg">{stall.businessName} {stall.verified ? "✅" : "⏳"} {stall.featured && "⭐ FEATURED"}</p>
              <p className="text-sm text-zinc-400">{stall.category} | {stall.whatsapp} | Views: {stall.views} | Clicks: {stall.clicks} | Rating: {stall.rating} | Rent: {stall.rentExpiry}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={()=>toggleVerify(stall.id)} className={`px-4 py-2 rounded font-bold ${stall.verified ? "bg-yellow-500 text-black" : "bg-green-500 text-black"}`}>{stall.verified ? "Unverify" : "Approve"}</button>
              <button onClick={()=>toggleFeatured(stall.id)} className="px-4 py-2 rounded bg-white text-black font-bold">{stall.featured ? "Unfeature" : "Make Featured"}</button>
              <button onClick={()=>deleteShop(stall.id)} className="px-4 py-2 rounded bg-red-600 font-bold">Delete</button>
              <a href={`https://wa.me/${stall.whatsapp}`} target="_blank" className="px-4 py-2 rounded bg-green-800">WhatsApp</a>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-zinc-500 text-sm">Link stays: wuse-market-online.vercel.app — auto deploys in 2 mins after you commit.</p>
    </div>
  )
}
