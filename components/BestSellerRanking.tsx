'use client';

import { Trophy, TrendingUp, Coins, Ticket, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

// ... imports
import Link from 'next/link';

const BestSellerRanking = () => {
    const [stats, setStats] = useState([
        {
            icon: Trophy,
            title: 'Best Seller',
            desc: 'Top Rated Items',
            color: 'from-pink-500 via-red-500 to-yellow-500', // Colorful
            textColor: 'text-red-900',
            link: '/best-sellers'
        },
        {
            icon: TrendingUp,
            title: 'Weekly Progress',
            desc: 'Hot this Week',
            color: 'from-blue-400 to-indigo-500',
            textColor: 'text-blue-900',
            link: '/weekly-hot'
        },
        {
            icon: Ticket,
            title: 'Coupons',
            desc: 'Apply & Save',
            color: 'from-emerald-400 to-teal-500',
            textColor: 'text-teal-900',
            link: '/coupons'
        }
    ]);

    const { user } = useAuth();
    // ... fetch logic (unchanged)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Try fetching personal stats if logged in
                let personalItems = null;

                if (user && user.email) {
                    const personalDocRef = doc(db, 'settings', 'home-stats', 'users', user.email);
                    const personalSnap = await getDoc(personalDocRef);
                    if (personalSnap.exists()) {
                        const data = personalSnap.data();
                        if (data.isActive) {
                            personalItems = data.items;
                        }
                    }
                }

                // 2. If no personal stats or not logged in, fetch global
                let fetchedItems = personalItems;
                if (!fetchedItems) {
                    const docRef = doc(db, 'settings', 'home-stats');
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        fetchedItems = docSnap.data().items;
                    }
                }

                if (fetchedItems) {
                    const mappedStats = stats.map((defaultStat, index) => {
                        if (fetchedItems[index]) {
                            return {
                                ...defaultStat,
                                title: fetchedItems[index].title || defaultStat.title,
                                desc: fetchedItems[index].desc || defaultStat.desc
                            }
                        }
                        return defaultStat;
                    });
                    setStats(mappedStats);
                }
            } catch (error) {
                console.error("Error fetching home stats:", error);
            }
        };

        fetchStats();
    }, [user]); // Re-run when user auth state changes

    return (
        <section className="px-4 py-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Link href={stat.link || '#'} key={index} className="block h-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group cursor-pointer h-full"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 rounded-3xl group-hover:opacity-20 transition-opacity`}></div>
                            <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-lg flex items-center gap-5 hover:scale-[1.02] transition-transform duration-300 h-full">
                                <div className={`bg-gradient-to-br ${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                                    <stat.icon size={28} />
                                </div>
                                <div>
                                    <h3 className={`font-black text-lg ${stat.textColor} mb-1`}>{stat.title}</h3>
                                    <p className="text-gray-500 text-sm font-medium">{stat.desc}</p>
                                </div>
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                                    <Award size={24} className={stat.textColor} />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default BestSellerRanking;
