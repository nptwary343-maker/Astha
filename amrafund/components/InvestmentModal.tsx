"use client";

import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface InvestmentModalProps {
    project: {
        title: string;
        sector: string;
        roi: string;
        tenure: string;
    } | null;
    onClose: () => void;
}

export default function InvestmentModal({ project, onClose }: InvestmentModalProps) {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!project) return null;

    const handleInvest = async () => {
        setLoading(true);
        try {
            await addDoc(collection(db, 'amrafund_investments'), {
                projectTitle: project.title,
                sector: project.sector,
                amount: Number(amount),
                status: 'Pending Verification',
                createdAt: serverTimestamp(),
                legalStatus: 'Judicial Stamp Pending'
            });
            setSuccess(true);
        } catch (e) {
            console.error(e);
            alert("Investment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white">{project.title}</h3>
                        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-1">E-Farming Partnership</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-8">
                    {!success ? (
                        <>
                            {step === 1 ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Target ROI</p>
                                            <p className="text-lg font-black text-emerald-400">{project.roi}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Tenure</p>
                                            <p className="text-lg font-black text-white">{project.tenure}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Investment Amount (৳)</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-500">৳</span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="Enter amount"
                                                className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-12 pr-6 text-2xl font-black text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-gray-700"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-3 font-medium">Minimum investment: ৳ 5,000</p>
                                    </div>

                                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-3xl flex items-start gap-4">
                                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                                            <ShieldCheck size={20} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Legal Protection</p>
                                            <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                                                By proceeding, you agree to sign a 300 TK Judicial Stamp agreement upon payment verification.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!amount || Number(amount) < 5000}
                                        className="w-full bg-emerald-500 text-black py-5 rounded-[1.5rem] font-black text-lg hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-30 flex items-center justify-center gap-3"
                                    >
                                        Continue to Payment
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-[2rem] bg-emerald-500 text-black text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">Total to Pay</p>
                                        <p className="text-4xl font-black">৳ {Number(amount).toLocaleString()}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Select Payment Method</p>
                                        <button className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#D12053] rounded-xl flex items-center justify-center font-black text-white">b</div>
                                                <div className="text-left">
                                                    <p className="font-bold text-white text-sm">bKash Personal</p>
                                                    <p className="text-[10px] text-gray-500">01700-000000</p>
                                                </div>
                                            </div>
                                            <div className="w-6 h-6 rounded-full border-2 border-white/20 group-hover:border-emerald-500 transition-all" />
                                        </button>

                                        <button className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center font-black text-white">n</div>
                                                <div className="text-left">
                                                    <p className="font-bold text-white text-sm">Nagad Personal</p>
                                                    <p className="text-[10px] text-gray-500">01700-000000</p>
                                                </div>
                                            </div>
                                            <div className="w-6 h-6 rounded-full border-2 border-white/20 group-hover:border-emerald-500 transition-all" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleInvest}
                                        disabled={loading}
                                        className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black text-lg hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-2xl"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : "Confirm Investment"}
                                    </button>
                                    <button onClick={() => setStep(1)} className="w-full text-[10px] font-black uppercase text-gray-500 tracking-widest hover:text-white transition-colors">
                                        Go Back
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 space-y-6">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={40} className="text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-black text-white">Application Received!</h3>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                                Our legal team will verify your payment and prepare the **Deed of Agreement**. You will receive an SMS shortly.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full bg-emerald-500 text-black py-5 rounded-[1.5rem] font-black text-lg hover:bg-emerald-400 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
