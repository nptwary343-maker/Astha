/**
 * AmraFund Master Configuration
 * All legal labels, project sectors, and governance rules are defined here.
 */

export const AMRAFUND_CONFIG = {
    name: 'E-Farming Partnership',
    tagline: 'আইনি সুরক্ষায় আধুনিক কৃষি বিপ্লব',
    version: '1.0.0',
    legal: {
        instrument: "300 TK Judicial Stamp",
        governingAct: "Contract Act 1872",
        auditStandard: "Real-time Blockchain-style Logging",
    },
    sectors: [
        {
            id: "agri",
            name: "Agricultural Projects",
            icon: "Leaf",
            description: "সরাসরি খামারিদের সাথে কন্ট্রাক্ট ফার্মিং।",
        },
        {
            id: "carbon",
            name: "Carbon Trading",
            icon: "Wind",
            description: "পরিবেশ রক্ষায় কার্বন ক্রেডিট ইনভেস্টমেন্ট।",
        },
        {
            id: "startup",
            name: "SME & Startups",
            icon: "Rocket",
            description: "ক্ষুদ্র উদ্যোক্তাদের ফান্ডিং এবং মার্কেট লিঙ্কেজ।",
        },
    ],
    governance: {
        profitSharingModel: "Profit-Loss Sharing (PLS)",
        taxExemptionLimit: 500000, // 5 Lakh BDT as per Income Tax Act 2023
        minInvestment: 500, // Micro-investing starts from 500 BDT
    }
};
