export interface Customer {
    name?: string;
    phone?: string;
    address?: string;
}

export interface OrderHelpers {
    total: number;
    subtotal?: number;
    shipping?: number;
    tax?: number;
    discount?: number;
    due?: number;
}

export interface PaymentStatus {
    status: 'Paid' | 'Pending' | 'Partially Paid' | 'Failed' | 'Unpaid';
    method?: string;
    trxId?: string;
    isVerified?: boolean;
}

export interface DeliveryMan {
    id: string;
    name: string;
    phone: string;
    status: 'Available' | 'Busy' | 'Offline';
    activeOrders?: number;
    createdAt?: string;
}

export interface Order {
    id: string;
    invoiceNumber?: string;
    source?: string;
    customer?: Customer;
    totals?: OrderHelpers;
    payment?: PaymentStatus;
    createdAt?: { seconds: number };
    status?: string;
    items?: any[];
    assignedTo?: string;
    assignedManName?: string;
    assignedManPhone?: string;
    orderStatus?: string;
    date?: string;
    is_flagged_bot?: boolean;
    confirmedBy?: string;
    confirmedByPhone?: string;
    paymentStatus?: 'Paid' | 'Pending' | 'Partially Paid' | 'Failed' | 'Unpaid';
    fcmToken?: string;
    userEmail?: string;
}

export interface MessageTemplate {
    id: string;
    title: string;
    body: string;
    category: 'Order' | 'Marketing';
    createdAt?: any;
    updatedAt?: any;
}

export interface Product {
    id: string;
    name: string;
    brand?: string;
    price: number;
    salePrice?: number;
    category: string;
    images: string[];
    description?: string;
    tags?: string[];
    stock?: number;
    discount?: { type: 'percent' | 'flat', value: number } | null;
    discountValue?: number;
    discountType?: string;
    productionDate?: string;
    expirationDate?: string;
    wholesalePrice?: number;
    warrantyPeriod?: string;
    guaranteePeriod?: string;
    labReportUrl?: string;
    trackingInfo?: {
        status: 'Pickup Pending' | 'Picked Up' | 'In Quality Check' | 'Verified' | 'Shipped';
        location: string;
        updatedAt: string;
        pickupIcon?: string;
    };
}
