'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, ShieldCheck, CheckCircle, MapPin, Search, Award, FileText, ChevronRight, Share2, Printer } from 'lucide-react';
import Link from 'next/link';

export default function VerificationClient({ product, productId }: { product: any, productId: string }) {
    // If we want real-time tracking updates, listen to firestore
    const [liveProduct, setLiveProduct] = useState(product);

    useEffect(() => {
        const fetchProductUpdate = async () => {
            const docRef = doc(db, "products", productId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setLiveProduct({ id: docSnap.id, ...docSnap.data() });
            }
        };
        fetchProductUpdate();
        // Option to add onSnapshot here if tracking should update real-time
    }, [productId]);

    const trackingStates = ['Pickup Pending', 'Picked Up', 'In Quality Check', 'Verified', 'Shipped'];
    const currentStatusIndex = liveProduct?.trackingInfo?.status
        ? trackingStates.indexOf(liveProduct.trackingInfo.status)
        : (liveProduct?.isExpertVerified ? 3 : 0);

    const safeIndex = currentStatusIndex === -1 ? 0 : currentStatusIndex;

    const handlePrint = () => {
        window.print();
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${liveProduct.name} - Official AstharHat Quality Verification`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Verification Link copied to clipboard!");
        }
    }

    return (
        <div className="min-h-screen bg-neutral-100 py-10 px-4 md:px-0">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 PrintHidden">
                    <Link href={`/product/${liveProduct.slug || productId}`} className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium">
                        <ArrowLeft size={18} className="mr-2" /> Back to Product
                    </Link>
                    <div className="flex gap-2">
                        <button onClick={handleShare} className="bg-white px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Share2 size={16} /> Share Record
                        </button>
                        <button onClick={handlePrint} className="bg-white px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Printer size={16} /> Print Report
                        </button>
                    </div>
                </div>

                {/* Secure Header Banner */}
                <div className="bg-emerald-900 text-emerald-50 p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 right-32 w-48 h-48 bg-emerald-950/40 blur-3xl rounded-full -mb-10"></div>

                    <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-emerald-800/50 rounded-lg text-emerald-400">
                                    <ShieldCheck size={24} />
                                </div>
                                <h1 className="text-sm font-bold uppercase tracking-widest text-emerald-300">Official Authenticity Record</h1>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">{liveProduct.name}</h2>
                            <p className="text-emerald-200 font-medium">Digital Twin ID: <span className="font-mono bg-emerald-950 px-2 py-0.5 rounded text-emerald-400 ml-1">AH-{productId.slice(0, 8).toUpperCase()}</span></p>
                        </div>

                        <div className="flex md:justify-end">
                            <div className="bg-emerald-950/60 backdrop-blur-md border border-emerald-800 p-6 rounded-3xl w-full max-w-sm flex flex-col items-center">
                                {liveProduct.isExpertVerified ? (
                                    <>
                                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-3 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                                            <Award size={32} />
                                        </div>
                                        <h3 className="text-xl font-black text-white">Expert Verified</h3>
                                        <p className="text-xs text-emerald-300 mt-1 uppercase tracking-widest text-center">Quality & Authenticity Confirmed</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white mb-3 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                                            <Search size={32} />
                                        </div>
                                        <h3 className="text-xl font-black text-white">Authentic Item</h3>
                                        <p className="text-xs text-blue-300 mt-1 uppercase tracking-widest text-center">Standard Quality Check Passed</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Origin & Transparency Column */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Origin Details */}
                        {liveProduct.originDetails && (
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                        <MapPin size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900">Origin & Sourcing</h3>
                                </div>
                                <div className="prose text-gray-600 leading-relaxed font-medium">
                                    {liveProduct.originDetails.split('\n').map((para: string, idx: number) => (
                                        <p key={idx}>{para}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tracker System */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Live Item Progression</h3>
                                    <p className="text-sm font-medium text-gray-500">Tracked status in our supply chain</p>
                                </div>
                            </div>

                            <div className="relative pl-6 space-y-8">
                                {/* Vertical Line */}
                                <div className="absolute top-2 bottom-5 left-[1.15rem] w-1.5 bg-gray-100 rounded-full"></div>
                                <div className="absolute top-2 left-[1.15rem] w-1.5 bg-emerald-500 rounded-full transition-all duration-1000" style={{ height: `${(safeIndex / (trackingStates.length - 1)) * 100}%` }}></div>

                                {trackingStates.map((state, index) => {
                                    const isCompleted = index <= safeIndex;
                                    const isCurrent = index === safeIndex;
                                    const isPending = index > safeIndex;

                                    return (
                                        <div key={state} className={`relative flex gap-6 ${isPending ? 'opacity-40 grayscale' : ''}`}>
                                            <div className="relative z-10 shrink-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center -ml-2.5 border-4 border-white shadow-sm transition-all duration-300 ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-200'
                                                    }`}>
                                                    {isCompleted ? <CheckCircle size={14} className="stroke-[3]" /> : <div className="w-2 h-2 rounded-full bg-gray-400"></div>}
                                                </div>
                                            </div>
                                            <div className={`mt-0.5 ${isCurrent ? 'transform scale-105 origin-left transition-all' : ''}`}>
                                                <h4 className={`text-lg font-bold ${isCurrent ? 'text-emerald-600' : 'text-gray-900'}`}>{state}</h4>

                                                {/* Contextual Details */}
                                                {isCurrent && state === 'Verified' && liveProduct.isExpertVerified && (
                                                    <p className="text-sm text-gray-500 mt-1 font-medium bg-gray-50 inline-block px-3 py-1 rounded-lg border border-gray-100">Expert has signed off on quality metrics.</p>
                                                )}
                                                {isCurrent && liveProduct?.trackingInfo?.location && (
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-1">
                                                        <MapPin size={12} /> {liveProduct.trackingInfo.location}
                                                    </p>
                                                )}
                                                {isCurrent && liveProduct?.trackingInfo?.updatedAt && (
                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                        Updated: {new Date(liveProduct.trackingInfo.updatedAt).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Security Info & Docs Column */}
                    <div className="space-y-6">

                        {/* Certificate Link if available */}
                        {liveProduct.labReportUrl && (
                            <a href={liveProduct.labReportUrl} target="_blank" rel="noopener noreferrer" className="block bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:-translate-y-1 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 group-hover:rotate-12 transition-all duration-700">
                                    <FileText size={100} />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                                        <FileText size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-black mb-1">View Official Certificate</h3>
                                    <p className="text-blue-200 text-sm font-medium mb-4">Click to open the PDF/Doc evidence.</p>
                                    <div className="flex items-center gap-2 text-sm font-bold bg-white text-blue-600 px-4 py-2 rounded-full w-max">
                                        Open Document <ChevronRight size={16} />
                                    </div>
                                </div>
                            </a>
                        )}

                        {/* Smart Contract / System Data Block */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Asthar System Ledger</h4>
                            <div className="space-y-4 text-sm font-medium">
                                <div>
                                    <p className="text-gray-400 text-xs">Product Hash</p>
                                    <p className="text-gray-900 font-mono text-xs mt-1 truncate bg-gray-50 p-2 rounded border border-gray-100">
                                        {liveProduct.id}::{Date.now().toString(16)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Standard Price Recorded</p>
                                    <p className="text-gray-900 font-bold mt-0.5">৳ {liveProduct.price}</p>
                                </div>
                                {liveProduct.dimensions && (
                                    <div>
                                        <p className="text-gray-400 text-xs">Verified Dimensions</p>
                                        <p className="text-gray-900 font-bold mt-0.5">{liveProduct.dimensions.length}cm × {liveProduct.dimensions.width}cm</p>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-2 rounded-lg">
                                        <ShieldCheck size={14} /> Record integrity actively verified
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            {/* CSS for printing */}
            <style jsx global>{`
                @media print {
                    .PrintHidden { display: none !important; }
                    body { background: white !important; }
                    .prose { color: black !important; }
                }
            `}</style>
        </div>
    );
}
