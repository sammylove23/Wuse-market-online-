import React, { useState } from 'react';
import { StallItem } from '../types';
import { Eye, MessageCircle, Calendar, Upload, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, Copy, Check } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';

interface VendorDashboardProps {
  stalls: StallItem[];
  onStallUpdated?: (stall: StallItem) => void;
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({ stalls, onStallUpdated }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [fakeOtp, setFakeOtp] = useState('');
  const [loggedInStall, setLoggedInStall] = useState<StallItem | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Renewal modal
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const cleanNum = (num: string) => num.replace(/\D/g, '');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleaned = cleanNum(phoneNumber);
    if (!cleaned || cleaned.length < 9) {
      setErrorMsg('Please enter a valid Nigerian WhatsApp number.');
      return;
    }

    // Match vendor by WhatsApp number (support both 080... and 23480...)
    const found = stalls.find((s) => {
      const sNum = cleanNum(s.whatsapp);
      return sNum.endsWith(cleaned.slice(-10)) || cleaned.endsWith(sNum.slice(-10));
    });

    if (!found) {
      setErrorMsg(`No stall registered with number ${phoneNumber}. (Try 2348039124455 for Aisha Fabrics or 2348123456789 for Chinedu Phones)`);
      return;
    }

    // Step 2: Show fake OTP (demo auto-fills)
    setOtpStep(true);
    setFakeOtp('9412');
    setLoggedInStall(found);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Log in vendor!
    setOtpStep(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('6146477338');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleSubmitRenewal = async () => {
    if (!loggedInStall || !receiptPreview) return;
    setUploadingReceipt(true);
    try {
      const stallRef = doc(db, 'stalls', loggedInStall.id);
      await updateDoc(stallRef, {
        renewalStatus: 'pending_renewal',
        renewalReceipt: receiptPreview,
        renewalRequestedAt: new Date().toISOString(),
      });

      const updated = {
        ...loggedInStall,
        renewalStatus: 'pending_renewal' as const,
        renewalReceipt: receiptPreview,
        renewalRequestedAt: new Date().toISOString(),
      };
      setLoggedInStall(updated);
      onStallUpdated?.(updated);
      setShowRenewModal(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `stalls/${loggedInStall.id}`);
    } finally {
      setUploadingReceipt(false);
    }
  };

  // If not logged in
  if (!loggedInStall || otpStep) {
    return (
      <div className="max-w-md mx-auto py-10 px-4">
        <div className="bg-[#1A1410] border-2 border-orange-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-2xl mx-auto mb-4">
            🏪
          </div>
          <h2 className="text-2xl font-black text-center text-white">Vendor Portal Login</h2>
          <p className="text-xs text-zinc-400 text-center mt-1 mb-6">
            Access your Wuse Market shop analytics, WhatsApp customer clicks & stall renewal.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!otpStep ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Registered WhatsApp Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0803 912 4455 or 2348039124455"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[#120E0B] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#008751] hover:bg-emerald-600 font-bold text-sm shadow-lg shadow-green-800/30 transition flex items-center justify-center gap-2"
              >
                <span>Send WhatsApp OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-zinc-500">
                  Demo hint: Use Aisha Fabrics number (<strong>2348039124455</strong>) or Chinedu (<strong>2348123456789</strong>)
                </span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs">
                OTP sent to WhatsApp: <strong>{fakeOtp}</strong> (Auto-filled for demo)
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Enter 4-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={fakeOtp}
                  onChange={(e) => setFakeOtp(e.target.value)}
                  className="w-full bg-[#120E0B] border border-zinc-700 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 font-bold text-sm shadow-lg shadow-orange-700/30 transition"
              >
                Verify & Open Dashboard
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Calculate days left for rent
  const today = new Date();
  const expiry = new Date(loggedInStall.rentExpiry || '2027-12-31');
  const diffTime = expiry.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-[#FF6B00] text-[11px] font-bold border border-orange-500/30">
            Vendor Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2">
            <span>{loggedInStall.name}</span>
            <span className="text-xs bg-emerald-700 text-white px-2 py-0.5 rounded-md font-bold">
              Stall #{loggedInStall.stallNumber}
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Category: <span className="capitalize text-zinc-300 font-semibold">{loggedInStall.category}</span> • WhatsApp: {loggedInStall.whatsapp}
          </p>
        </div>

        <button
          onClick={() => {
            setLoggedInStall(null);
            setPhoneNumber('');
          }}
          className="text-xs text-zinc-400 hover:text-white border border-zinc-700 px-3 py-1.5 rounded-xl self-start sm:self-auto"
        >
          Logout
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Stall Views */}
        <div className="bg-[#1A1410] border border-orange-500/20 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>My Stall Views Today</span>
            <Eye className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-black text-white">{loggedInStall.views}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Walk-in shoppers who tapped stall</p>
        </div>

        {/* WhatsApp Clicks */}
        <div className="bg-[#1A1410] border border-emerald-500/20 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>WhatsApp Direct Clicks</span>
            <MessageCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {loggedInStall.whatsappClicks || Math.floor(loggedInStall.views * 0.16)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Shoppers directed to your chat</p>
        </div>

        {/* Rent Expiry */}
        <div className="bg-[#1A1410] border border-amber-500/20 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
              <span>Stall Rent Status</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              {daysLeft > 0 ? `${daysLeft} Days Left` : 'Expired'}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Expiry: {loggedInStall.rentExpiry}</p>
          </div>

          <div className="mt-3">
            {loggedInStall.renewalStatus === 'pending_renewal' ? (
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
                ⏳ Renewal Pending Admin Review
              </span>
            ) : (
              <button
                onClick={() => setShowRenewModal(true)}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-orange-600 hover:brightness-110 text-white font-bold text-xs transition shadow-md shadow-orange-600/30"
              >
                Renew Stall (₦5k/week)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RENEW MODAL */}
      {showRenewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#1C1511] border-2 border-orange-500/40 rounded-3xl p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-white mb-1">Renew Stall for 1 Week</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Stall fee: <strong>₦5,000 per week</strong>. Keep your stall active 24/7 on the Wuse 2D map.
            </p>

            {/* Bank Transfer Details */}
            <div className="p-4 rounded-2xl bg-black/40 border border-zinc-700 space-y-3 mb-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Bank / Provider:</span>
                <span className="font-bold text-white">OPAY</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Account Number:</span>
                <div className="flex items-center gap-2 font-mono font-bold text-amber-400 text-base">
                  <span>6146477338</span>
                  <button
                    onClick={handleCopyAccount}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    title="Copy Account Number"
                  >
                    {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Account Name:</span>
                <span className="font-bold text-white">Abdulrasheed samuel yusuf</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800">
                <span className="text-zinc-400">Amount:</span>
                <span className="font-bold text-emerald-400 text-sm">₦5,000 / week</span>
              </div>
            </div>

            {/* Receipt Upload */}
            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-zinc-300">
                Upload Payment Screenshot / Transfer Receipt *
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#008751] file:text-white hover:file:bg-emerald-600"
              />

              {receiptPreview && (
                <div className="mt-2 h-40 rounded-xl overflow-hidden border border-zinc-700 bg-black">
                  <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowRenewModal(false)}
                className="w-1/2 py-3 rounded-xl border border-zinc-700 text-xs font-bold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!receiptPreview || uploadingReceipt}
                onClick={handleSubmitRenewal}
                className="w-1/2 py-3 rounded-xl bg-[#008751] hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg shadow-green-700/30"
              >
                {uploadingReceipt ? 'Submitting...' : 'Submit Receipt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
