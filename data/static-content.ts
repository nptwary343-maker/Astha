// data/static-content.ts

export const CATEGORIES = [
    { id: '1', name: 'Bazar', icon: 'shopping-bag', color: 'orange', image: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png' },
    { id: '2', name: 'Furniture', icon: 'home', color: 'blue', image: 'https://cdn-icons-png.flaticon.com/512/3043/3043530.png' },
    { id: '3', name: 'Medicine', icon: 'pill', color: 'red', image: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png' },
    { id: '4', name: 'Natural Product', icon: 'leaf', color: 'green', image: 'https://cdn-icons-png.flaticon.com/512/2909/2909890.png' },
    { id: '5', name: 'Electronics', icon: 'zap', color: 'blue', image: 'https://cdn-icons-png.flaticon.com/512/3659/3659899.png' },
    { id: '6', name: 'Fashion', icon: 'shirt', color: 'pink', image: 'https://cdn-icons-png.flaticon.com/512/3050/3050306.png' },
    { id: '7', name: 'Entertainment', icon: 'play', color: 'indigo', image: 'https://cdn-icons-png.flaticon.com/512/3408/3408545.png' },
    { id: '8', name: 'Books', icon: 'book', color: 'indigo', image: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png' },
    { id: '9', name: 'Snacks', icon: 'coffee', color: 'orange', image: 'https://cdn-icons-png.flaticon.com/512/3504/3504827.png' },
    { id: '10', name: 'Beauty', icon: 'sparkles', color: 'pink', image: 'https://cdn-icons-png.flaticon.com/512/3163/3163212.png' },
];

export const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Deals', href: '/deals' },
    { label: 'About', href: '/about' },
];

export const FOOTER_LINKS = {
    company: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Careers', href: '/careers' },
    ],
    support: [
        { label: 'FAQs', href: '/faqs' },
        { label: 'Shipping', href: '/shipping' },
        { label: 'Returns', href: '/returns' },
    ],
    legal: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
    ]
};

export const BENEFITS = [
    { title: 'Free Shipping', desc: 'On orders over ৳1000', icon: 'truck' },
    { title: 'Secure Payment', desc: '100% secure checkout', icon: 'shield-check' },
    { title: '24/7 Support', desc: 'Get help anytime', icon: 'phone' },
];
