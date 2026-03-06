'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, CheckCircle2, Coins, Calendar, ArrowRight } from 'lucide-react';

const DAYS = [
    { day: 1, reward: 10, label: 'Mon' },
    { day: 2, reward: 15, label: 'Tue' },
    { day: 3, reward: 20, label: 'Wed' },
    { day: 4, reward: 25, label: 'Thu' },
    { day: 5, reward: 30, label: 'Fri' },
    { day: 6, reward: 50, label: 'Sat' },
    { day: 7, reward: 100, label: 'Sun', bonus: true },
];

export default function MobileCheckIn() {
    const [checkedIn, setCheckedIn] = useState(false);
    const [currentDay, setCurrentDay] = useState(3); // Mocking day 3 for demo
    const [showReward, setShowReward] = useState(false);
    const [rewardAmount, setRewardAmount] = useState(0);

    const handleCheckIn = () => {
        if (checkedIn) return;

        setRewardAmount(DAYS[currentDay - 1].reward);
        setCheckedIn(true);
        setShowReward(true);

        // Hide reward after 3 seconds
        setTimeout(() => setShowReward(false), 3000);
    };

    return (
        <section className="md:hidden px-4 py-6 bg-white border-b border-slate-100 overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-brand-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Daily Rewards</span>
                    </div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Check-in Streak</h2>
                </div>
                <div className="flex items-center gap-1.5 bg-brand-primary/10 px-3 py-1.5 rounded-full border border-brand-primary/20">
                    <Coins size={14} className="text-brand-primary" />
                    <span className="text-xs font-black text-brand-primary">450 pts</span>
                </div>
            </div>

            {/* Progress Row */}
            <div className="flex justify-between items-center gap-2 mb-8 no-scrollbar overflow-x-auto pb-2">
                {DAYS.map((item) => {
                    const isToday = item.day === currentDay;
                    const isCompleted = item.day < currentDay || (isToday && checkedIn);

                    return (
                        <div key={item.day} className="flex flex-col items-center gap-3 shrink-0">
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center relative transition-all duration-500 border ${isCompleted
                                    ? 'bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/30'
                                    : isToday
                                        ? 'bg-white border-brand-primary border-2 shadow-xl shadow-brand-primary/10'
                                        : 'bg-slate-50 border-slate-100'
                                    }`}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 size={18} className="text-white" />
                                ) : (
                                    <>
                                        <span className={`text-[10px] font-black ${isToday ? 'text-brand-primary' : 'text-slate-400'}`}>
                                            +{item.reward}
                                        </span>
                                        {item.bonus && <Sparkles size={10} className="absolute -top-1 -right-1 text-orange-500 animate-pulse" />}
                                    </>
                                )}
                            </motion.div>
                            <span className={`text-[9px] font-bold uppercase tracking-tighter ${isToday ? 'text-brand-primary' : 'text-slate-500'}`}>
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Check-in Button */}
            <motion.button
                onClick={handleCheckIn}
                disabled={checkedIn}
                whileTap={{ scale: 0.95 }}
                animate={!checkedIn ? {
                    y: [0, -4, 0],
                } : {}}
                transition={!checkedIn ? {
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                } : {}}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] relative overflow-hidden transition-all duration-500 ${checkedIn
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20'
                    }`}
            >
                <div className="relative z-10 flex items-center justify-center gap-3">
                    {checkedIn ? (
                        <>
                            Done for today
                            <CheckCircle2 size={18} />
                        </>
                    ) : (
                        <>
                            Claim Day {currentDay} Reward
                            <Sparkles size={18} className="text-brand-primary" />
                        </>
                    )}
                </div>

                {!checkedIn && (
                    <motion.div
                        animate={{ x: ['100%', '-100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                    />
                )}
            </motion.button>

            {/* Success Animation Overlay */}
            <AnimatePresence>
                {showReward && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-64 h-64 bg-brand-primary/20 rounded-full blur-[60px]"
                        />

                        <div className="relative space-y-4 text-center">
                            <motion.div
                                initial={{ y: 20 }}
                                animate={{ y: [0, -20, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <div className="w-24 h-24 bg-brand-primary rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(8,_112,_184,_0.5)] mx-auto">
                                    <Coins size={48} className="text-white" />
                                </div>
                            </motion.div>

                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-slate-950 uppercase italic">Greatness!</h3>
                                <p className="text-sm font-bold text-slate-500">You've claimed <span className="text-brand-primary">+{rewardAmount} points</span></p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex gap-2 justify-center"
                            >
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            y: [0, -40],
                                            opacity: [1, 0],
                                            x: (i - 2) * 20
                                        }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="absolute"
                                    >
                                        <Sparkles size={16} className="text-brand-primary" />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Insight */}
            <div className="mt-4 flex items-center justify-between px-2">
                <p className="text-[10px] font-bold text-slate-400">Next: <span className="text-slate-600">Day 4 (+25 pts)</span></p>
                <Link href="/rewards" className="flex items-center gap-1 text-[10px] font-black text-brand-primary uppercase tracking-widest">
                    View Benefits <ArrowRight size={12} />
                </Link>
            </div>
        </section>
    );
}
