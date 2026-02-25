import { db } from './firebase';
import { collection, addDoc, getDocs, query, limit, doc, setDoc } from 'firebase/firestore';

export const seedMockData = async () => {
    try {
        // 1. Seed Partners
        const partnersCol = collection(db, 'partners');
        const partnersSnap = await getDocs(query(partnersCol, limit(1)));
        if (partnersSnap.empty) {
            const mockPartners = [
                { name: 'Sri Mongolian Family Tree', logoUrl: 'https://images.unsplash.com/photo-1599305090748-ebcc1902096e?q=80&w=200', active: true, order: 0 },
                { name: 'Dhaka Logistics Hub', logoUrl: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?q=80&w=200', active: true, order: 1 },
                { name: 'Chittagong Port Authority', logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=200', active: true, order: 2 },
                { name: 'Sylhet Tea Gardens', logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200', active: true, order: 3 },
                { name: 'Rajshahi Silk Factory', logoUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=200', active: true, order: 4 },
            ];
            for (const p of mockPartners) await addDoc(partnersCol, p);
            console.log("✅ Seeded Partners");
        }

        // 2. Seed Coupons
        const couponsCol = collection(db, 'coupons');
        const couponsSnap = await getDocs(query(couponsCol, limit(1)));
        if (couponsSnap.empty) {
            await addDoc(couponsCol, {
                code: 'ASTHAR30',
                title: 'ASTHAR30 – 30% Off First Order',
                description: 'Get exclusive discount on your very first purchase at AstharHat.',
                discount: 30,
                expiry: null,
                imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
                active: true,
                applicableLocations: ['all']
            });
            console.log("✅ Seeded Coupons");
        }

        // 3. Seed Locations
        const locationsCol = collection(db, 'businessLocations');
        const locationsSnap = await getDocs(query(locationsCol, limit(1)));
        if (locationsSnap.empty) {
            const mockLocations = [
                { name: 'Dhaka Flagship Hub', address: 'Banani Road 11', city: 'Dhaka', area: 'Banani', imageUrl: 'https://images.unsplash.com/photo-1587140824219-01f3d3b0a002?q=80&w=400', active: true },
                { name: 'Chittagong Port Store', address: 'Agrabad C/A', city: 'Chittagong', area: 'Agrabad', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400', active: true },
            ];
            for (const l of mockLocations) await addDoc(locationsCol, l);
            console.log("✅ Seeded Locations");
        }

        // 4. Seed Home Banners (Particle Banners)
        const bannersCol = collection(db, 'homeBanners');
        const bannersSnap = await getDocs(query(bannersCol, limit(1)));
        if (bannersSnap.empty) {
            const mockBanners = [
                {
                    title: 'New Spring Collection',
                    subtitle: 'Experience the premium quality of handpicked electronics.',
                    imageUrl: 'https://images.unsplash.com/photo-1511740847322-c99455c10cad?q=80&w=2000',
                    buttonText: 'Shop the Collection',
                    buttonLink: '/shop',
                    bannerType: 'primary',
                    active: true,
                    order: 0
                },
                {
                    title: 'Exclusive Tech Gadgets',
                    subtitle: 'Up to 40% off on all accessories.',
                    imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c33c09b6c?q=80&w=1000',
                    buttonText: 'View Deals',
                    buttonLink: '/shop?category=tech',
                    bannerType: 'secondary',
                    active: true,
                    order: 1
                }
            ];
            for (const b of mockBanners) await addDoc(bannersCol, b);
            console.log("✅ Seeded Home Banners");
        }

        // 5. Initialize Site Settings
        const settingsRef = doc(db, 'settings', 'site-settings');
        const settingsSnap = await getDocs(query(collection(db, 'settings'), limit(1)));
        if (settingsSnap.empty) {
            // Document doesn't exist, we need to create it specifically as 'site-settings'
            const { setDoc } = await import('firebase/firestore');
            await setDoc(settingsRef, {
                enableHomeParticleEffects: true,
                maintenanceMode: false,
                version: '1.2.0'
            });
            console.log("✅ Initialized Site Settings");
        }

        return true;
    } catch (e) {
        console.error("Seeding failed:", e);
        return false;
    }
};
