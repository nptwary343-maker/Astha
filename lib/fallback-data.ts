/**
 * 🛡️ RESILIENCE LAYER: Static Fallback Data
 * Used when Firebase or Middleware is unreachable/timeout.
 */

export const FALLBACK_PRODUCTS = [
    {
        id: 'fallback-1',
        name: 'Premium Tea (Fallback)',
        category: 'Tea',
        price: 250,
        images: ['https://placehold.co/400x400?text=Tea'],
        stock: 99
    },
    {
        id: 'fallback-2',
        name: 'Fresh Vegetables (Fallback)',
        category: 'Vegetables',
        price: 150,
        images: ['https://placehold.co/400x400?text=Veggie'],
        stock: 99
    }
];

export const FALLBACK_SETTINGS = {
    description: "Asthar Hat - Resilience Mode Active",
    address: "Dhaka, Bangladesh (Offline Sync)",
    phone: "+8801700000000",
    email: "support@astharhat.com",
    established: "EST. 2024",
    logoUrl: "", // Empty means use default icon
    payments: { bkash: true, cod: true, nagad: true, visa: true, mastercard: true },
    social: { facebook: "#", youtube: "#", linkedin: "#", instagram: "#" },
    partners: [
        { id: 'p1', title: 'Asthar Hat Global', logo: '' }
    ]
};
