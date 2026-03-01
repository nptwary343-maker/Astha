'use client';
export const runtime = 'edge';

import React from 'react';
import PolicyLayout from '@/components/PolicyLayout';

export default function PrivacyPage() {
    return (
        <PolicyLayout
            title="Privacy"
            description="How we protect and manage your personal data at AstharHat."
            lastUpdated="October 2024"
        >
            <section className="space-y-6">
                <h2 className="text-3xl font-black italic tracking-tight">1. Information Collection</h2>
                <p>We collect information that you provide directly to us when you create an account, place an order, or communicate with us. This may include your name, email address, phone number, shipping address, and payment information.</p>
            </section>

            <section className="space-y-6">
                <h2 className="text-3xl font-black italic tracking-tight">2. Use of Information</h2>
                <p>We use the information we collect to provide, maintain, and improve our services, process your transactions, send you technical notices, and respond to your comments or questions.</p>
            </section>

            <section className="space-y-6">
                <h2 className="text-3xl font-black italic tracking-tight">3. Data Security</h2>
                <p>We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.</p>
            </section>

            <section className="space-y-6">
                <h2 className="text-3xl font-black italic tracking-tight">4. Third-Party Disclosure</h2>
                <p>We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information unless we provide you with advance notice, except as described in this policy.</p>
            </section>
        </PolicyLayout>
    );
}
