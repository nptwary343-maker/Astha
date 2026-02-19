import { ShoppingBag, Home, Pill, Leaf, Zap, Shirt, Play, Book, Coffee, Sparkles, Layers, DollarSign } from 'lucide-react';

export const MENU_ITEMS = [
    { name: 'All Products', icon: Layers, href: '/shop' },
    {
        name: 'Bazar (Daily Grocery)',
        icon: ShoppingBag,
        href: '/shop?category=bazar',
        subItems: [
            { name: 'Rice & Grains', href: '/shop?category=rice' },
            { name: 'Oils & Spices', href: '/shop?category=spices' },
            { name: 'Fresh Vegetables', href: '/shop?category=vegetables' },
        ]
    },
    {
        name: 'Furniture',
        icon: Home,
        href: '/shop?category=furniture',
        subItems: [
            { name: 'Living Room', href: '/shop?category=living-room' },
            { name: 'Office Furniture', href: '/shop?category=office' },
        ]
    },
    {
        name: 'Medicine',
        icon: Pill,
        href: '/shop?category=medicine',
        subItems: [
            { name: 'OTC Drugs', href: '/shop?category=otc' },
            { name: 'First Aid', href: '/shop?category=first-aid' },
        ]
    },
    {
        name: 'Natural Product',
        icon: Leaf,
        href: '/shop?category=natural',
        subItems: [
            { name: 'Organic Honey', href: '/shop?category=honey' },
            { name: 'Herbal Tea', href: '/shop?category=herbal' },
        ]
    },
    {
        name: 'Electronics',
        icon: Zap,
        href: '/shop?category=electronics',
        subItems: [
            { name: 'Smartphones', href: '/shop?category=smartphones' },
            { name: 'Gadgets', href: '/shop?category=gadgets' },
        ]
    },
    {
        name: 'Fashion',
        icon: Shirt,
        href: '/shop?category=fashion',
        subItems: [
            { name: "Men's Fashion", href: '/shop?category=mens-fashion' },
            { name: "Women's Fashion", href: '/shop?category=womens-fashion' },
        ]
    },
    {
        name: 'Entertainment',
        icon: Play,
        href: '/shop?category=entertainment',
        subItems: [
            { name: 'Gaming', href: '/shop?category=gaming' },
            { name: 'Toys', href: '/shop?category=toys' },
        ]
    },
    {
        name: 'Books',
        icon: Book,
        href: '/shop?category=books',
        subItems: [
            { name: 'Fiction', href: '/shop?category=fiction' },
            { name: 'Self Help', href: '/shop?category=self-help' },
        ]
    },
    {
        name: 'Snacks',
        icon: Coffee,
        href: '/shop?category=snacks',
        subItems: [
            { name: 'Chocolates', href: '/shop?category=chocolates' },
            { name: 'Beverages', href: '/shop?category=beverages' },
        ]
    },
    {
        name: 'Beauty',
        icon: Sparkles,
        href: '/shop?category=beauty',
        subItems: [
            { name: 'Skincare', href: '/shop?category=skincare' },
            { name: 'Makeup', href: '/shop?category=makeup' },
        ]
    },
    {
        name: 'Shop by Budget',
        icon: DollarSign,
        href: '/shop',
        subItems: [
            { name: 'Under ৳500', href: '/shop?maxPrice=500' },
            { name: '৳500 - ৳2000', href: '/shop?minPrice=500&maxPrice=2000' },
            { name: '৳2000 - ৳5000', href: '/shop?minPrice=2000&maxPrice=5000' },
            { name: 'Premium (Over ৳5000)', href: '/shop?minPrice=5000' },
        ]
    },
];


