"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  Loader2, Search, Mail, Phone, CheckCircle2, 
  CornerUpLeft, Archive, RefreshCw, ChevronDown 
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const easeOut = [0.22, 1, 0.36, 1];

const STATUS_OPTIONS = ["Unread", "Replied", "Resolved"];

export default function MessagesAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("avenue_token");
      const { data } = await axios.get(`${API_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(data.messages || data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem("avenue_token");
      const { data } = await axios.put(
        `${API_URL}/messages/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        setMessages(messages.map(m => m._id === id ? { ...m, status: newStatus } : m));
      }
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeOut }} className="space-y-6">
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121310] border border-white/5 p-6 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-1">Total Inquiries</span>
            <div className="font-serif text-3xl text-white">{messages.length}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#C9944A]/10 flex items-center justify-center">
            <Mail className="text-[#C9944A]" size={20} />
          </div>
        </div>
        
        <div className="bg-[#121310] border border-white/5 p-6 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-1">Unread</span>
            <div className="font-serif text-3xl text-amber-400">
              {messages.filter(m => m.status === "Unread").length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <CornerUpLeft className="text-amber-400" size={20} />
          </div>
        </div>

        <div className="bg-[#121310] border border-white/5 p-6 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-1">Resolved</span>
            <div className="font-serif text-3xl text-green-400">
              {messages.filter(m => m.status === "Resolved").length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="text-green-400" size={20} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[#121310] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="font-serif text-xl text-white">Contact Inbox</h2>
            <button onClick={fetchMessages} className="text-white/40 hover:text-[#C9944A] transition-colors" title="Refresh">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search name, email, subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#080906] border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-[#C9944A] transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center text-white/50">
            <Loader2 className="animate-spin mb-4 text-[#C9944A]" size={24} />
            Fetching messages...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-10 text-center text-white/50 text-sm">No messages found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
            {filteredMessages.map((msg) => (
              <div key={msg._id} className="bg-[#121310] p-6 hover:bg-[#1A1C18] transition-colors flex flex-col justify-between min-h-[250px]">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-medium">{msg.subject}</h3>
                      <p className="text-[10px] text-white/40 mt-1">{new Date(msg.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        value={msg.status}
                        onChange={(e) => handleStatusChange(msg._id, e.target.value)}
                        disabled={updatingId === msg._id}
                        className={`appearance-none border rounded-lg px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold outline-none cursor-pointer transition-colors ${
                          msg.status === "Unread" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                          msg.status === "Replied" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                          "bg-green-500/10 border-green-500/30 text-green-400"
                        }`}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt} className="bg-[#121310] text-white">{opt}</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#C9944A]/10 flex items-center justify-center text-[#C9944A] text-xs font-bold">
                      {msg.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm">{msg.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-white/40 mt-0.5">
                        <span className="flex items-center gap-1"><Mail size={10} /> {msg.email}</span>
                        {msg.phone && <span className="flex items-center gap-1"><Phone size={10} /> {msg.phone}</span>}
                      </div>
                    </div>
                  </div>

                  <p className="text-white/60 text-sm leading-relaxed bg-[#080906] p-4 rounded-xl border border-white/5 italic">
                    "{msg.message}"
                  </p>
                </div>

                <div className="mt-6 flex gap-2">
                  <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="flex-1 py-2 text-center rounded-lg bg-white/5 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#C9944A] hover:text-[#080906] transition-colors flex items-center justify-center gap-2">
                    <CornerUpLeft size={12} /> Reply via Email
                  </a>
                  {msg.status !== "Resolved" && (
                    <button onClick={() => handleStatusChange(msg._id, "Resolved")} className="px-4 py-2 rounded-lg border border-white/10 text-white/40 hover:text-green-400 hover:border-green-500/30 transition-colors" title="Mark Resolved">
                      <Archive size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}