/**
 * AmraFund Database Schema Definitions (TypeScript Interfaces)
 * Designed for legal compliance and transparent tracking.
 */

export interface Investor {
    id: string;
    name: string;
    email: string;
    phone: string;
    nidNumber: string; // Required for Legal Compliance
    nidImageFront: string; // Cloudinary URL
    nidImageBack: string; // Cloudinary URL
    kycStatus: 'Pending' | 'Verified' | 'Rejected';
    totalInvested: number;
    totalEarnings: number;
    joinedAt: Date;
}

export interface InvestmentProject {
    id: string;
    title: string;
    category: 'Agri' | 'Carbon' | 'SME';
    targetAmount: number;
    raisedAmount: number;
    status: 'Draft' | 'Open' | 'Funded' | 'Active' | 'Closed';
    expectedROI: string; // e.g., "15-20% Harvest Share"
    duration: string; // e.g., "6 Months"
    location: string;
    images: string[];
    description: string;
    marketLink: string; // Link to Asthar Hat products if applicable
}

export interface DeedRecord {
    id: string;
    investorId: string;
    projectId: string;
    stampSerialNumber: string; // 300 TK Stamp ID
    digitalHash: string; // Unique security hash
    deedImageUrl: string;
    status: 'Draft' | 'Signed' | 'Verified';
    createdAt: Date;
}

export interface AuditLog {
    id: string;
    action: string;
    performedBy: string; // Admin ID
    targetId: string; // Project or Investor ID
    timestamp: Date;
    details: any;
    ipAddress: string;
}
