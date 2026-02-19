'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Sparkles, X, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---
interface Message {
    role: 'user' | 'assistant';
    content: string;
}

type Mode = 'Turbo' | 'Logic' | 'Research';

// --- MAIN PANEL ---
export default function AdminAIPanel() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Standby');
    const [useUncensored, setUseUncensored] = useState(false);
    const [mode, setMode] = useState<Mode>('Turbo');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => scrollToBottom(), [messages]);

    const handleClear = () => {
        if (confirm("Nuclear Wipe initiated. Clear core memory?")) setMessages([]);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setStatus('Processing...');

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages.concat(userMsg).map(m => ({ role: m.role, content: m.content })),
                    useUncensored,
                    mode,
                    // 🛡️ Proving Admin Identity via INTERNAL_SECRET
                    secret: 'ah_prod_secure_2026_x86_z'
                })
            });

            if (!response.ok) throw new Error('System Sync Failed');

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error('No stream data');

            let accumulated = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6).trim();
                        if (dataStr === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(dataStr);
                            const content = parsed.response || parsed.choices?.[0]?.delta?.content || "";
                            accumulated += content;
                            setMessages(prev => {
                                const next = [...prev];
                                next[next.length - 1].content = accumulated;
                                return next;
                            });
                        } catch (e) { }
                    }
                }
            }

            setStatus('Active');
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection terminated. System recalibrating...' }]);
            setStatus('Offline');
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    return (
        <div className="relative w-full h-[800px] bg-black rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(245,158,11,0.08),transparent_50%)]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

            {/* ⚜️ Gold Header */}
            <div className="h-24 px-10 flex items-center justify-between z-20 bg-black/60 backdrop-blur-3xl border-b border-white/5">
                <div className="flex items-center gap-5">
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-amber-500/20 rounded-xl blur-xl group-hover:bg-amber-500/30 transition-all animate-pulse" />
                        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-orange-700 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                            <Sparkles className="text-black" size={24} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-[0.2em] text-white uppercase italic">Command Console</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{status}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
                        {(['Turbo', 'Logic', 'Research'] as Mode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    <div className="w-px h-8 bg-white/5 mx-2" />
                    <button onClick={handleClear} className="p-3 rounded-2xl text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* 💬 Message Stream */}
            <div className="flex-1 overflow-y-auto px-10 py-10 space-y-10 scroll-smooth scrollbar-none relative z-10">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-20">
                        <div className="w-24 h-24 rounded-full border-2 border-amber-500/30 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                            <div className="w-16 h-1 w-full bg-amber-500/50 blur-sm" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-3xl font-light text-white tracking-[0.3em] uppercase">Ready</h3>
                            <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-2">Personal Strategist Online</p>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`relative max-w-[80%] p-6 rounded-3xl text-[15px] leading-relaxed transition-all ${msg.role === 'user'
                                    ? 'bg-zinc-900 border border-white/10 text-white rounded-tr-none shadow-2xl'
                                    : 'bg-amber-500/5 border border-amber-500/10 text-zinc-100 rounded-tl-none shadow-[0_0_30px_rgba(245,158,11,0.05)]'
                                    }`}>
                                    {msg.content || (
                                        <div className="flex gap-1.5 p-1">
                                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-100" />
                                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-200" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* ⌨️ Control Console */}
            <div className="p-10 bg-black/80 backdrop-blur-3xl border-t border-white/5 z-20">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${useUncensored ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-zinc-800'}`}>
                                    <input type="checkbox" checked={useUncensored} onChange={(e) => setUseUncensored(e.target.checked)} className="hidden" />
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${useUncensored ? 'left-7' : 'left-1'}`} />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${useUncensored ? 'text-red-500' : 'text-zinc-600'}`}>
                                    Uncensored Brain
                                </span>
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-amber-500 rounded-full animate-ping" />
                            <span className="text-[10px] font-bold text-zinc-700 tracking-widest uppercase italic">Echelon Sync: SECURE</span>
                        </div>
                    </div>

                    <div className="relative group/input">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 blur-xl opacity-0 group-focus-within/input:opacity-100 transition-all duration-500" />
                        <div className="relative flex items-center bg-zinc-950 border border-white/10 rounded-2xl shadow-3xl focus-within:border-amber-500/50 transition-all overflow-hidden">
                            <div className="pl-6 text-amber-500/40 font-mono text-xl select-none italic">{">"}</div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Execute System Directive..."
                                className="flex-1 bg-transparent py-6 px-10 text-white text-base focus:outline-none placeholder-zinc-800 font-medium"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="mr-3 p-4 bg-amber-500 text-black rounded-xl hover:bg-amber-400 disabled:opacity-20 transition-all active:scale-95 shadow-lg shadow-amber-500/10"
                            >
                                <Send size={24} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
