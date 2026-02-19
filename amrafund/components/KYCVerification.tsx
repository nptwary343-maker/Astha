"use client";

import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import {
    IdCard,
    ShieldCheck,
    Upload,
    CheckCircle2,
    AlertCircle,
    FileText,
    Loader2,
    Globe
} from 'lucide-react';

export default function KYCVerification() {
    const [step, setStep] = useState(0); // 0: Select Type, 1: Scan, 2: Review, 3: Pending
    const [uploading, setUploading] = useState(false);
    const [ocrResult, setOcrResult] = useState<any>(null);
    const [citizenType, setCitizenType] = useState<'BD' | 'Foreigner' | null>(null);

    const handleDigitalScan = async () => {
        setUploading(true);
        setTimeout(() => {
            setOcrResult({
                name: citizenType === 'BD' ? "Rahman Khan" : "John Doe",
                idNumber: citizenType === 'BD' ? "1234567890" : "GL-987654321",
                type: citizenType === 'BD' ? "NID" : "Global ID / Passport",
                nationality: citizenType === 'BD' ? "Bangladeshi" : "International"
            });
            setUploading(false);
            setStep(2);
        }, 3000);
    };

    const submitForManualReview = () => {
        setUploading(true);
        setTimeout(() => {
            setUploading(false);
            setStep(3);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
            <div className="max-w-xl w-full">
                {/* Progress header */}
                <div className="flex items-center justify-between mb-12">
                    {[0, 1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= s ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
                                {step > s ? <CheckCircle2 size={16} /> : s + 1}
                            </div>
                            {s < 3 && <div className={`h-px w-10 md:w-16 ${step > s ? 'bg-emerald-500' : 'bg-white/5'}`}></div>}
                        </div>
                    ))}
                </div>

                {step === 0 && (
                    <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                        <h2 className="text-3xl font-black tracking-tighter mb-8">Choose Your Identity</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => { setCitizenType('BD'); setStep(1); }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500 transition-all group"
                            >
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <IdCard size={28} />
                                </div>
                                <h3 className="font-bold">BD Citizen</h3>
                                <p className="text-[10px] text-gray-500 uppercase mt-2">NID Verification</p>
                            </button>
                            <button
                                onClick={() => { setCitizenType('Foreigner'); setStep(1); }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500 transition-all group"
                            >
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Globe size={28} />
                                </div>
                                <h3 className="font-bold">Foreigner</h3>
                                <p className="text-[10px] text-gray-500 uppercase mt-2">National ID / Passport (Optional)</p>
                            </button>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-400 mx-auto mb-8">
                            <IdCard size={40} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter mb-4">{citizenType === 'BD' ? 'NID' : 'Global ID'} Scanning</h2>
                        <p className="text-gray-400 mb-10 leading-relaxed text-sm">
                            {citizenType === 'BD' ? 'Bangladeshi NID' : 'Your country\'s National ID or Passport (Optional)'} is used for digital contract signing under international law.
                        </p>
                        <div className="space-y-4">
                            <button onClick={handleDigitalScan} className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
                                {uploading ? <Loader2 className="animate-spin" /> : `Scan ${citizenType === 'BD' ? 'NID' : 'ID / Passport'}`}
                            </button>
                            <button onClick={() => setStep(0)} className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-white transition-colors">Change Identity Type</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-2xl font-black tracking-tight mb-4">Digital Data Extracted</h2>
                        <div className="space-y-3 mb-8 bg-black/40 p-6 rounded-2xl border border-white/5">
                            <div className="flex justify-between text-xs"><span className="text-gray-500 uppercase">Name:</span> <span className="font-bold">{ocrResult?.name}</span></div>
                            <div className="flex justify-between text-xs"><span className="text-gray-500 uppercase">{ocrResult?.type} No:</span> <span className="font-bold">{ocrResult?.idNumber}</span></div>
                            <div className="flex justify-between text-xs"><span className="text-gray-500 uppercase">Nationality:</span> <span className="font-bold">{ocrResult?.nationality}</span></div>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-8 uppercase font-black tracking-widest">Now, submit for Final Manual Confirmation by Admin.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="flex-1 border border-white/10 py-4 rounded-2xl font-black text-sm text-gray-400">Scan Again</button>
                            <button onClick={submitForManualReview} className="flex-[2] bg-emerald-500 text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all">
                                {uploading ? 'Submitting...' : 'Confirm & Send'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 text-center">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                            <ShieldCheck size={40} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight mb-4">Pending Approval</h2>
                        <p className="text-gray-400 mb-10 leading-relaxed text-sm">
                            আপনার তথ্য রেকর্ড করা হয়েছে। এখন আমাদের টিম এটি **ম্যানুয়ালি** চেক করে নিশ্চিত করবে। সাধারণত ২৪ ঘন্টার মধ্যে আপনি কনফার্মেশন মেইল পাবেন।
                        </p>
                        <div className="space-y-4">
                            <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 flex items-center justify-between">
                                <span className="text-xs font-bold text-yellow-500 uppercase">Manual Review in Progress</span>
                                <Loader2 className="animate-spin text-yellow-500" size={16} />
                            </div>
                            <button className="w-full bg-white/5 text-white/50 py-4 rounded-2xl font-black text-sm uppercase tracking-widest cursor-not-allowed">
                                Waiting for Confirmation
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
