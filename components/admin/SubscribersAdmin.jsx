"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  Loader2, Search, Download, Users, Mail, 
  Trash2, ChevronDown, CheckCircle2, XCircle 
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const easeOut = [0.22, 1, 0.36, 1];

export default function SubscribersAdmin() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("avenue_token");
      const { data } = await axios.get(`${API_URL}/subscribers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscribers(data.subscribers || data);
    } catch (error) {
      console.error("Failed to fetch subscribers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem("avenue_token");
      const { data } = await axios.put(
        `${API_URL}/subscribers/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setSubscribers(subscribers.map(s => s._id === id ? { ...s, status: newStatus } : s));
      }
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subscriber?")) return;
    try {
      const token = localStorage.getItem("avenue_token");
      await axios.delete(`${API_URL}/subscribers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscribers(subscribers.filter(s => s._id !== id));
    } catch (error) {
      alert("Failed to delete subscriber");
    }
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = subscribers.filter(s => s.status === "Subscribed").length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeOut }} className="space-y-6">
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121310] border border-white/5 p-6 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-1">Total Subscribers</span>
            <div className="font-serif text-3xl text-white">{subscribers.length}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#C9944A]/10 flex items-center justify-center">
            <Users className="text-[#C9944A]" size={20} />
          </div>
        </div>

        <div className="bg-[#121310] border border-white/5 p-6 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-1">Active List</span>
            <div className="font-serif text-3xl text-green-400">{activeCount}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="text-green-400" size={20} />
          </div>
        </div>

        <div className="bg-[#121310] border border-white/5 p-6 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-1">Unsubscribed</span>
            <div className="font-serif text-3xl text-red-400">
              {subscribers.length - activeCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle className="text-red-400" size={20} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#121310] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-serif text-xl text-white">Newsletter List</h2>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="text" 
                placeholder="Search email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#080906] border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-[#C9944A] transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors shrink-0">
              <Download size={14} /> CSV
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 flex flex-col items-center justify-center text-white/50">
              <Loader2 className="animate-spin mb-4 text-[#C9944A]" size={24} />
              Fetching subscribers...
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-10 text-center text-white/50 text-sm">No subscribers found.</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/40 bg-white/[0.02]">
                  <th className="p-4 font-medium">Email Address</th>
                  <th className="p-4 font-medium">Date Joined</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((sub) => (
                  <tr key={sub._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                          <Mail size={14} className="text-[#C9944A]" />
                        </div>
                        <span className="text-sm text-white font-medium">{sub.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-white/60">
                      {new Date(sub.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <div className="relative inline-block w-36">
                        <select
                          value={sub.status}
                          onChange={(e) => handleStatusChange(sub._id, e.target.value)}
                          disabled={updatingId === sub._id}
                          className={`appearance-none w-full border rounded-lg px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold outline-none cursor-pointer transition-colors ${
                            sub.status === "Subscribed" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"
                          }`}
                        >
                          <option value="Subscribed" className="bg-[#121310] text-white">Subscribed</option>
                          <option value="Unsubscribed" className="bg-[#121310] text-white">Unsubscribed</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(sub._id)} className="p-2 rounded-full text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete Subscriber">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}