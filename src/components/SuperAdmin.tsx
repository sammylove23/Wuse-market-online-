import React, { useState, useEffect } from 'react';
import { StallItem, LeadItem } from '../types';
import { ShieldCheck, Eye, MessageCircle, Calendar, CheckCircle, Trash2, Key, Users, FileText, Image, AlertTriangle } from 'lucide-react';
import { collection, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';

interface SuperAdminProps {
  stalls: StallItem[];
  onStallsChanged?: () => void;
}

const SUPER_ADMIN_PASSWORD = 'Christylove239';

export const SuperAdmin: React.FC<SuperAdminProps> = ({ stalls, onStallsChanged }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'stalls' | 'receipts' | 'leads'>('stalls');
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<{ stallName: string; receiptUrl: string } | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === SUPER_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
      fetchLeads();
    } else {
      setAuthError('Wrong Chairman Password');
    }
  };

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const snap = await getDocs(collection(db, 'leads'));
      const list: LeadItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          shopName: data.shopName || 'Unknown Shop',
          whatsapp: data.whatsapp || '',
          instagram: data.instagram || '',
          category: data.category || '',
          createdAt: data.createdAt || new Date().toISOString(),
          status: data.status || 'pending',
        });
      });
      setLeads(list);
    } catch (err) {
      console.warn('Leads fetch note:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  // Approve payment & extend rent by 7 days
  const handleApproveRent = async (stall: StallItem) => {
    try {
      const currentExpiry = new Date(stall.rentExpiry || new Date());
      // Add 7 days
      currentExpiry.setDate(currentExpiry.getDate() + 7);
      const newExpiryStr = currentExpiry.toISOString().split('T')[0];

      const stallRef = doc(db, 'stalls', stall.id);
      await updateDoc(stallRef, {
        rentExpiry: newExpiryStr,
        renewalStatus: 'active',
      });

      setActionSuccess(`Approved! Rent for ${stall.name} extended by 7 days to ${newExpiryStr}.`);
      setTimeout(() => setActionSuccess(''), 4000);
      onStallsChanged?.();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `stalls/${stall.id}`);
    }
  };

  // Delete fake or unwanted stall
  const handleDeleteStall = async (stallId: string, stallName: string) => {
    if (!confirm(`Are you sure you want to delete stall "${stallName}"?`)) return;

    try {
      await deleteDoc(doc(db, 'stalls', stallId));
      setActionSuccess(`Stall "${stallName}" deleted successfully.`);
      setTimeout(() => setActionSuccess(''), 4000);
      onStallsChanged?.();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `stalls/${stallId}`);
    }
  };

  // Stalls with pending receipt upload
  const pendingReceipts = stalls.filter((s) => s.renewalStatus === 'pending_renewal' || s.renewalReceipt);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-[#1C1511] border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-2xl mx-auto mb-4 text-red-400">
            <Key className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-center text-white">Super Admin Access</h2>
          <p className="text-xs text-zinc-400 text-center mt-1 mb-6">
            Restricted control panel for approving rent receipts, lead management & moderation.
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Chairman Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter Chairman Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#120E0B] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-sm shadow-lg shadow-red-700/30 transition"
            >
              Unlock Super Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 w-full text-white">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase border border-red-500/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Super Admin Console</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">Wuse Market Management</h2>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('stalls')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'stalls' ? 'bg-[#FF6B00] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Stalls ({stalls.length})
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-3 py-1.5 rounded-lg transition relative ${
              activeTab === 'receipts' ? 'bg-[#008751] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Receipts</span>
            {pendingReceipts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[10px] font-black">
                {pendingReceipts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('leads');
              fetchLeads();
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'leads' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Leads ({leads.length})
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* TAB 1: ALL STALLS */}
      {activeTab === 'stalls' && (
        <div className="bg-[#1A1410] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-black/40 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Stall / Business</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">WhatsApp</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4">WA Clicks</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Rent Expiry</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {stalls.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span>{s.name}</span>
                    </td>
                    <td className="py-3 px-4 capitalize">{s.category}</td>
                    <td className="py-3 px-4 font-mono text-[11px]">{s.whatsapp}</td>
                    <td className="py-3 px-4 font-bold text-orange-400">{s.views}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{s.whatsappClicks || 0}</td>
                    <td className="py-3 px-4 text-amber-400 font-bold">★ {s.rating || 5.0}</td>
                    <td className="py-3 px-4 font-mono text-[11px]">{s.rentExpiry}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleApproveRent(s)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px]"
                        title="Extend rent by 7 days"
                      >
                        +7 Days
                      </button>
                      <button
                        onClick={() => handleDeleteStall(s.id, s.name)}
                        className="p-1 rounded-lg bg-red-950 hover:bg-red-900 text-red-400"
                        title="Delete Stall"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RECEIPTS */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          {pendingReceipts.length === 0 ? (
            <div className="bg-[#1A1410] border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400 text-xs">
              No pending payment receipts right now.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingReceipts.map((s) => (
                <div key={s.id} className="bg-[#1A1410] border border-orange-500/30 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm">{s.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                        {s.renewalStatus || 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">WhatsApp: {s.whatsapp}</p>
                    <p className="text-xs text-zinc-400">Current Expiry: {s.rentExpiry}</p>

                    {s.renewalReceipt && (
                      <div
                        onClick={() => setSelectedReceipt({ stallName: s.name, receiptUrl: s.renewalReceipt! })}
                        className="mt-3 h-36 rounded-xl overflow-hidden bg-black border border-zinc-700 cursor-pointer group relative"
                      >
                        <img src={s.renewalReceipt} alt="Receipt" className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold transition">
                          Click to View Full Receipt
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <button
                      onClick={() => handleApproveRent(s)}
                      className="w-full py-2 rounded-xl bg-[#008751] hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Extend 7 Days</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LEADS FROM /ADVERTISE */}
      {activeTab === 'leads' && (
        <div className="bg-[#1A1410] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          {loadingLeads ? (
            <div className="p-8 text-center text-xs text-zinc-400">Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400">No leads submitted yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-black/40 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Shop Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">WhatsApp</th>
                    <th className="py-3 px-4">Instagram</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Direct Chat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-bold text-white">{l.shopName}</td>
                      <td className="py-3 px-4 capitalize">{l.category}</td>
                      <td className="py-3 px-4 font-mono">{l.whatsapp}</td>
                      <td className="py-3 px-4 text-zinc-400">{l.instagram || '—'}</td>
                      <td className="py-3 px-4 text-zinc-400 text-[11px]">{l.createdAt.slice(0, 10)}</td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`https://wa.me/${l.whatsapp.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(
                            l.shopName
                          )}%2C%20this%20is%20Wuse%20Market%20Online%20Admin%20regarding%20your%20stall%20rental!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat Vendor</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Full receipt view modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-[#1C1511] border-2 border-orange-500/40 rounded-3xl p-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <h3 className="font-bold text-sm">Receipt: {selectedReceipt.stallName}</h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-xs bg-zinc-800 px-3 py-1 rounded-lg hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="h-96 rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <img src={selectedReceipt.receiptUrl} alt="Receipt" className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
