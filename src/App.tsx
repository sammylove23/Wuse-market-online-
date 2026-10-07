import { useState } from "react"
import SuperAdmin from "./pages/SuperAdmin"

type Shop = { id: string; name: string; category: string; whatsapp: string; verified: boolean }

const demoShops: Shop[] = [
  { id: "1", name: "Mama Nkechi Fabrics", category: "Fashion", whatsapp: "08031234567", verified: true },
  { id: "2", name: "Uche Electronics", category: "Electronics", whatsapp: "08061234567", verified: true },
  { id: "3", name: "Abuja Fresh Foods", category: "Food", whatsapp: "08091234567", verified: false },
]

export default function App() {
  // HIDDEN ADMIN - only shows when you go to /super-admin
  if (window.location.pathname === "/super-admin") {
    return <SuperAdmin />
  }

  const [search, setSearch] = useState("")
  const filtered = demoShops.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h1 className="font-black text-xl">WUSE MARKET <span className="text-green-500">ONLINE</span></h1>
        <a href="https://wa.me/2348012345678" className="bg-green-500 text-black px-4 py-2 rounded-full font-bold text-sm">Sell on Wuse</a>
      </header>

      {/* Search */}
      <div className="p-4">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search shops, products..." className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 outline-none" />
      </div>

      {/* Shops */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map(shop => (
          <div key={shop.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <h3 className="font-bold">{shop.name} {shop.verified && "✅"}</h3>
            <p className="text-zinc-400 text-sm">{shop.category}</p>
            <a href={`https://wa.me/234${shop.whatsapp.slice(1)}`} target="_blank" className="mt-3 block bg-green-500 text-black text-center py-2 rounded-lg font-bold">Chat on WhatsApp</a>
          </div>
        ))}
      </div>

      <footer className="p-6 text-center text-zinc-600 text-xs">Wuse Market Online - Abuja's #1 Online Market</footer>
    </div>
  )
}
