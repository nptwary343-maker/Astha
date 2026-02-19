'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    image?: string;
}

const AIConcierge: React.FC = () => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hello! I'm your AI shopping assistant. I can help you find products, track orders, or answer any questions about Asthar Hat. How can I help you today?"
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
                const compressedFile = await imageCompression(file, options);
                const reader = new FileReader();
                reader.onloadend = () => setSelectedImage(reader.result as string);
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                const reader = new FileReader();
                reader.onloadend = () => setSelectedImage(reader.result as string);
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSend = async () => {
        if (!input.trim() && !selectedImage) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            image: selectedImage || undefined
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        const currentImage = selectedImage;

        setIsLoading(true);
        setInput('');
        setSelectedImage(null);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages.concat(userMessage).map(m => ({ role: m.role, content: m.content })),
                    image: currentImage
                }),
            });

            if (!response.ok) throw new Error("API Failure");

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No stream");

            setIsLoading(false);
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            const decoder = new TextDecoder();
            let accumulatedContent = '';

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
                            accumulatedContent += content;

                            setMessages(prev => {
                                const next = [...prev];
                                next[next.length - 1].content = accumulatedContent;
                                return next;
                            });
                        } catch (e) { }
                    }
                }
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Re-syncing neural paths..." }]);
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowSidebar(true)}
                className="fixed bottom-32 left-8 z-[90] w-14 h-14 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-2xl border border-gray-100 dark:border-white/10 hover:scale-110 active:scale-95 transition-all group"
            >
                <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full group-hover:bg-blue-500/20 transition-all" />
                <Sparkles size={24} className="text-blue-600 dark:text-blue-400" />
            </button>

            <AnimatePresence>
                {showSidebar && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white dark:bg-[#0c0c0c] z-[110] shadow-2xl flex flex-col"
                    >
                        <div className="px-6 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base tracking-tight text-gray-900 dark:text-white">AI Assistant</h3>
                                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active System</p>
                                </div>
                            </div>
                            <button onClick={() => setShowSidebar(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-zinc-100 dark:bg-white/5' : 'bg-blue-600/10 text-blue-600'}`}>
                                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                        </div>
                                        <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-zinc-900 text-white rounded-tr-none'
                                            : 'bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-white/5'}`}
                                        >
                                            {msg.content || (isLoading && i === messages.length - 1 && <Loader2 size={16} className="animate-spin text-blue-500" />)}
                                            {msg.image && (
                                                <img src={msg.image} alt="Upload" className="mt-3 rounded-xl max-w-full border border-black/5 dark:border-white/10" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-gray-50/50 dark:bg-white/5 backdrop-blur-xl border-t border-gray-100 dark:border-white/5">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur opacity-0 group-focus-within/input:opacity-100 transition-all rounded-[32px]" />
                                <div className="relative bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-200 dark:border-white/10 p-2 flex flex-col gap-2 shadow-xl">
                                    {selectedImage && (
                                        <div className="px-4 pt-2 relative w-fit">
                                            <img src={selectedImage} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-blue-500 shadow-lg" />
                                            <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-end gap-2 px-2">
                                        <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-blue-500 transition-colors">
                                            <ImageIcon size={22} />
                                        </button>
                                        <textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend();
                                                }
                                            }}
                                            rows={1}
                                            placeholder="Ask anything..."
                                            className="flex-1 bg-transparent py-3 text-sm focus:outline-none dark:text-white resize-none max-h-32 scrollbar-none"
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={(!input.trim() && !selectedImage) || isLoading}
                                            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-30 disabled:hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showSidebar && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowSidebar(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                />
            )}
        </>
    );
};

export default AIConcierge;
