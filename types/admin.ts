// types/admin.ts

export interface HomeBanner {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    location?: string;
    active: boolean;
    order: number;
}

export interface BusinessLocation {
    id: string;
    name: string;
    address: string;
    city: string;
    area: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    imageUrl: string;
    active: boolean;
}

export interface ProductBlock {
    id: string;
    title: string;
    blockType: 'featured' | 'deals' | 'category' | 'new-arrival';
    locationIds: string[];
    productIds: string[];
    order: number;
    active: boolean;
}

export interface Coupon {
    id: string;
    code: string;
    title: string;
    description: string;
    discount: number;
    expiry: any; // Firebase Timestamp
    imageUrl: string;
    active: boolean;
    applicableLocations: string[];
}

export interface Partner {
    id: string;
    name: string;
    logoUrl: string;
    website?: string;
    order: number;
    active: boolean;
}
