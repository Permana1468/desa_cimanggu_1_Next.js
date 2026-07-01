"use client";

import { useState, useEffect, useRef } from "react";
import { 
    MessageSquare, 
    Send, 
    X, 
    Search, 
    ChevronLeft
} from "lucide-react";
import { 
    updateUserHeartbeat, 
    getChatContacts, 
    getChatHistory, 
    sendChatMessage 
} from "@/actions/chat";

export function FloatingChat({ session }: { session: any }) {
    const role = session?.user?.role;
    if (!role || role === "WARGA") return null;

    const currentUserId = session?.user?.id;

    const [isOpen, setIsOpen] = useState(false);
    const [contacts, setContacts] = useState<any[]>([]);
    const [activeContact, setActiveContact] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessageText, setNewMessageText] = useState("");
    const [contactSearch, setContactSearch] = useState("");
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [notificationToast, setNotificationToast] = useState<{ sender: string, message: string } | null>(null);

    const messageEndRef = useRef<HTMLDivElement>(null);
    const prevTotalUnreadRef = useRef<number | null>(null);
    const prevMessageCountRef = useRef<number>(0);

    // Play synthesized chimes using Web Audio API (zero external assets needed)
    const playNotificationSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            
            const playTone = (time: number, freq: number, duration: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.frequency.setValueAtTime(freq, time);
                osc.type = "sine";
                
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
                
                osc.start(time);
                osc.stop(time + duration);
            };
            
            const now = ctx.currentTime;
            playTone(now, 880, 0.15); // A5 note
            playTone(now + 0.1, 1320, 0.25); // E6 note
        } catch (e) {
            console.warn("Failed to play notification sound", e);
        }
    };

    // Auto-clear notification toast after 4 seconds
    useEffect(() => {
        if (!notificationToast) return;
        const timer = setTimeout(() => {
            setNotificationToast(null);
        }, 4000);
        return () => clearTimeout(timer);
    }, [notificationToast]);

    useEffect(() => {
        updateUserHeartbeat();

        const heartbeatInterval = setInterval(() => {
            updateUserHeartbeat();
        }, 15000);

        return () => clearInterval(heartbeatInterval);
    }, []);

    const fetchContacts = async (showLoading = false) => {
        if (showLoading) setLoadingContacts(true);
        try {
            const data = await getChatContacts();
            
            const newTotalUnread = data.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
            
            if (prevTotalUnreadRef.current !== null && newTotalUnread > prevTotalUnreadRef.current) {
                playNotificationSound();
                
                // Find contact with new unread messages
                const senderContact = data.find((c: any) => {
                    const prevC = contacts.find((pc: any) => pc.id === c.id);
                    return c.unreadCount > (prevC?.unreadCount || 0);
                });
                
                if (senderContact && (!isOpen || (activeContact && activeContact.id !== senderContact.id))) {
                    setNotificationToast({
                        sender: senderContact.fullName,
                        message: senderContact.lastMessage?.message || "Mengirim pesan baru"
                    });
                }
            }
            
            prevTotalUnreadRef.current = newTotalUnread;
            setContacts(data);
        } catch (e) {
            console.error(e);
        } finally {
            if (showLoading) setLoadingContacts(false);
        }
    };

    useEffect(() => {
        // Also fetch contacts periodically even if closed to show notifications and unread counts!
        fetchContacts(contacts.length === 0);

        const interval = setInterval(() => {
            fetchContacts();
        }, 2000);

        return () => clearInterval(interval);
    }, [isOpen]);

    const fetchMessages = async (showLoading = false) => {
        if (!activeContact) return;
        if (showLoading) setLoadingMessages(true);
        try {
            const data = await getChatHistory(activeContact.id);
            
            if (data.length > prevMessageCountRef.current) {
                const lastMsg = data[data.length - 1];
                if (lastMsg && lastMsg.senderId !== currentUserId && prevMessageCountRef.current > 0) {
                    playNotificationSound();
                }
            }
            
            prevMessageCountRef.current = data.length;
            setMessages(data);
        } catch (e) {
            console.error(e);
        } finally {
            if (showLoading) setLoadingMessages(false);
        }
    };

    useEffect(() => {
        if (!activeContact || !isOpen) return;
        fetchMessages(true);

        const interval = setInterval(() => {
            fetchMessages();
        }, 2000);

        return () => clearInterval(interval);
    }, [activeContact, isOpen]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessageText.trim() || !activeContact) return;

        const text = newMessageText.trim();
        setNewMessageText("");

        const tempMsg = {
            id: Math.random().toString(),
            senderId: currentUserId,
            receiverId: activeContact.id,
            message: text,
            createdAt: new Date(),
            isRead: false
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            await sendChatMessage(activeContact.id, text);
            fetchMessages();
            fetchContacts();
        } catch (e) {
            console.error(e);
        }
    };

    const filteredContacts = contacts.filter(c => 
        c.fullName.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.role.toLowerCase().includes(contactSearch.toLowerCase())
    );

    const totalUnread = contacts.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
            {isOpen && (
                <div className="w-[380px] sm:w-[400px] h-[580px] bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col mb-4 transition-all duration-300 animate-in slide-in-from-bottom-5">
                    <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-md shrink-0">
                        {activeContact ? (
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setActiveContact(null)} 
                                    className="p-1 hover:bg-white/10 rounded-full transition"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-black shadow-inner">
                                        {activeContact.fullName?.charAt(0)}
                                    </div>
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                                        activeContact.isOnline ? "bg-emerald-500" : "bg-slate-500"
                                    }`} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black truncate max-w-[180px]">{activeContact.fullName}</h4>
                                    <p className="text-[10px] text-teal-400 font-bold uppercase tracking-tight">{activeContact.role}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <MessageSquare size={20} className="text-teal-400" />
                                <div>
                                    <h4 className="text-sm font-black tracking-tight">Pesan Internal Desa</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Aparatur & Administrator</p>
                                </div>
                            </div>
                        )}
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-white/10 rounded-full transition"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
                        {activeContact ? (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
                                    {loadingMessages ? (
                                        <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            Memuat pesan...
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                                <MessageSquare size={20} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-400">Belum ada obrolan. Kirim pesan pertama untuk memulai!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.senderId === currentUserId;
                                            return (
                                                <div 
                                                    key={msg.id} 
                                                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                                >
                                                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs shadow-sm font-medium ${
                                                        isMe 
                                                            ? "bg-slate-900 text-white rounded-tr-none" 
                                                            : "bg-white text-slate-800 border border-slate-200/50 rounded-tl-none"
                                                    }`}>
                                                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                                        <span className="block text-[8px] mt-1 text-right text-slate-400">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messageEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200/60 flex items-center gap-2 shrink-0">
                                    <input 
                                        type="text"
                                        value={newMessageText}
                                        onChange={e => setNewMessageText(e.target.value)}
                                        placeholder="Ketik pesan..."
                                        className="flex-1 bg-slate-100/80 border-none rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!newMessageText.trim()}
                                        className="p-2.5 bg-slate-900 hover:bg-teal-600 text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center animate-in fade-in"
                                    >
                                        <Send size={14} />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="p-3 bg-white border-b border-slate-100 relative shrink-0">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input 
                                        type="text"
                                        placeholder="Cari kontak..."
                                        value={contactSearch}
                                        onChange={e => setContactSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-100/80 border-none rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>

                                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                                    {loadingContacts && contacts.length === 0 ? (
                                        <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            Memuat daftar...
                                        </div>
                                    ) : filteredContacts.length === 0 ? (
                                        <div className="p-8 text-center text-xs font-bold text-slate-400">
                                            Kontak tidak ditemukan
                                        </div>
                                    ) : (
                                        filteredContacts.map((contact) => (
                                            <div 
                                                key={contact.id}
                                                onClick={() => {
                                                    setActiveContact(contact);
                                                    prevMessageCountRef.current = 0;
                                                }}
                                                className="p-3.5 flex items-center justify-between hover:bg-slate-100/60 cursor-pointer transition"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="relative shrink-0">
                                                        <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
                                                            {contact.fullName?.charAt(0)}
                                                        </div>
                                                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                                            contact.isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                                                        }`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <h5 className="text-xs font-black text-slate-800 truncate max-w-[160px]">{contact.fullName}</h5>
                                                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-bold uppercase tracking-tight shrink-0">{contact.role}</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                                            {contact.lastMessage 
                                                                ? `${contact.lastMessage.senderId === currentUserId ? "Anda: " : ""}${contact.lastMessage.message}` 
                                                                : "Belum ada percakapan"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    {contact.lastMessage && (
                                                        <span className="text-[8px] font-bold text-slate-400">
                                                            {new Date(contact.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                    {contact.unreadCount > 0 && (
                                                        <span className="w-4 h-4 bg-teal-500 text-white rounded-full text-[8px] font-black flex items-center justify-center shadow-sm">
                                                            {contact.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {notificationToast && (
                <div 
                    onClick={() => {
                        setIsOpen(true);
                        const targetContact = contacts.find(c => c.fullName === notificationToast.sender);
                        if (targetContact) {
                            setActiveContact(targetContact);
                            prevMessageCountRef.current = 0;
                        }
                        setNotificationToast(null);
                    }}
                    className="mb-3 mr-1 bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-white/10 max-w-[280px] animate-in fade-in slide-in-from-right-4 cursor-pointer hover:bg-slate-800 transition"
                >
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                        <h5 className="text-[10px] font-black uppercase tracking-wider text-teal-400">Pesan Masuk</h5>
                    </div>
                    <h4 className="text-xs font-black mt-1 truncate">{notificationToast.sender}</h4>
                    <p className="text-[10px] text-slate-300 truncate mt-0.5">{notificationToast.message}</p>
                </div>
            )}

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-slate-900 border border-white/20 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative group overflow-hidden ${
                    isOpen 
                        ? "bg-slate-900 text-white" 
                        : "bg-white/20 hover:bg-white/40 backdrop-blur-md"
                }`}
                title="Pesan Internal Desa"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition duration-300" />
                {isOpen ? (
                    <X size={22} className="relative z-10" />
                ) : (
                    <MessageSquare size={22} className="relative z-10" />
                )}
                {!isOpen && totalUnread > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-teal-500 text-white rounded-full text-[9px] font-black flex items-center justify-center border-2 border-white/50 shadow-md">
                        {totalUnread}
                    </span>
                )}
            </button>
        </div>
    );
}
