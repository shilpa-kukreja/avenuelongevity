"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  Loader2, Search, Users, Crown, Zap, Phone, 
  Settings2, X, Check, Shield, Infinity as InfinityIcon 
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const easeOut = [0.22, 1, 0.36, 1];

const TIER_OPTIONS = ["None", "Essential", "Signature", "Sanctuary"];

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Form State
  const [editTier, setEditTier] = useState("");
  const [editCredits, setEditCredits] = useState(0);
  const [editStatus, setEditStatus] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("avenue_token");
      const { data } = await axios.get(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter out other admins
      const nonAdmins = (data.users || []).filter(u => u.role !== "admin");
      setCustomers(nonAdmins);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openManageModal = (user) => {
    setSelectedUser(user);
    setEditTier(user.membershipTier || "None");
    setEditCredits(user.credits || 0);
    setEditStatus(user.membershipStatus || "Inactive");
    setUpdateSuccess(false);
    setIsModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("avenue_token");
      const { data } = await axios.put(
        `${API_URL}/auth/users/${selectedUser._id}`,
        {
          membershipTier: editTier,
          membershipStatus: editStatus,
          credits: Number(editCredits)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        // Update local state without refetching
        setCustomers(customers.map(c => c._id === selectedUser._id ? { ...c, membershipTier: editTier, membershipStatus: editStatus, credits: Number(editCredits) } : c));
        setUpdateSuccess(true);
        setTimeout(() => setIsModalOpen(false), 1500);
      }
    } catch (error) {
      alert("Failed to update customer");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const getImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop";
    if (url.startsWith("http")) return url;
    return `${API_URL.replace('/api', '')}${url}`;
  };

  // Premium Badge Component
  const TierBadge = ({ tier }) => {
    if (tier === "Sanctuary") return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold bg-[#C9944A]/10 text-[#C9944A] border border-[#C9944A]/30"><InfinityIcon size={10} /> Sanctuary</span>;
    if (tier === "Signature") return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30"><Crown size={10} /> Signature</span>;
    if (tier === "Essential") return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30"><Shield size={10} /> Essential</span>;
    return <span className="px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold bg-white/5 text-white/40 border border-white/10">Guest</span>;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeOut }} className="space-y-6">
      
      {/* MANAGE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#080906]/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#121310] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
              
              {/* Modal Header */}
              <div className="relative p-6 border-b border-white/5 flex items-center gap-4">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C9944A] to-transparent" />
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C9944A]/30">
                  <img src={getImageUrl(selectedUser?.avatar)} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-white">{selectedUser?.name}</h2>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{selectedUser?.email}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="ml-auto w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleUpdateUser} className="p-6 md:p-8 space-y-6">
                
                {/* Tier Selection */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-3">Membership Tier</label>
                  <div className="grid grid-cols-2 gap-3">
                    {TIER_OPTIONS.map(tier => (
                      <button key={tier} type="button" onClick={() => setEditTier(tier)}
                        className={`py-3 px-4 rounded-xl border text-[10px] uppercase tracking-widest font-bold transition-all ${editTier === tier ? "bg-[#C9944A]/10 border-[#C9944A] text-[#C9944A]" : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/30"}`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Credits & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Credits Balance</label>
                    <div className="relative">
                      <Zap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9944A]" />
                      <input type="number" value={editCredits} onChange={e => setEditCredits(e.target.value)} className="w-full bg-[#080906] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-[#C9944A]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Account Status</label>
                    <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full bg-[#080906] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#C9944A] appearance-none">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Past Due">Past Due</option>
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={isUpdating || updateSuccess} className="w-full mt-4 flex items-center justify-center gap-2 bg-[#C9944A] text-[#080906] py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors disabled:opacity-70">
                  {isUpdating ? <Loader2 size={16} className="animate-spin" /> : updateSuccess ? <><Check size={16} /> Updated Successfully</> : <><Settings2 size={16} /> Save Changes</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="font-serif text-3xl text-white mb-1">Customer Directory</h2>
          <p className="text-white/40 text-xs">Manage client profiles, memberships, and credits.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            placeholder="Search name, email, phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121310] border border-white/10 rounded-full py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
          />
        </div>
      </div>
      
      {/* TABLE */}
      <div className="bg-[#121310] border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-white/50">
              <Loader2 className="animate-spin mb-4 text-[#C9944A]" size={32} />
              Fetching customers...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-20 text-center text-white/50">No customers found.</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/40 bg-white/[0.02]">
                  <th className="p-6 font-medium">Customer</th>
                  <th className="p-6 font-medium">Contact</th>
                  <th className="p-6 font-medium">Tier</th>
                  <th className="p-6 font-medium">Credits</th>
                  <th className="p-6 font-medium text-right">Manage</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c, i) => (
                  <motion.tr 
                    key={c._id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-[#C9944A]/50 transition-colors">
                          <img src={getImageUrl(c.avatar)} alt={c.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{c.name}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">Joined {new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-xs text-white/80 flex items-center gap-1.5"><Phone size={12} className="text-[#C9944A]"/> {c.phone || "N/A"}</p>
                      <p className="text-[10px] text-white/40 mt-1">{c.email}</p>
                    </td>
                    <td className="p-6">
                      <TierBadge tier={c.membershipTier} />
                    </td>
                    <td className="p-6">
                      <div className={`flex items-center gap-1.5 text-sm font-mono ${c.credits > 0 ? "text-white" : "text-white/30"}`}>
                        <Zap size={14} className={c.credits > 0 ? "text-[#C9944A]" : "text-white/20"} />
                        {c.credits || 0}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => openManageModal(c)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-[#C9944A] hover:border-[#C9944A] hover:text-[#080906] text-white text-[10px] uppercase tracking-widest font-bold transition-all"
                      >
                        <Settings2 size={14} /> Manage
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}