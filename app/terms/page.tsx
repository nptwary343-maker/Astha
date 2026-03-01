'use client';
export const runtime = 'edge';

import React from 'react';
import PolicyLayout from '@/components/PolicyLayout';

export default function TermsPage() {
    return (
        <PolicyLayout
            title="Terms"
            description="Our service agreement and usage guidelines for AstharHat."
            lastUpdated="October 2024"
        >
            <section className="space-y-6">
                <h2 className="text-3xl font-black italic tracking-tight">1. Agreement to Terms</h2>
                <p>By accessing or using our services, you agree to be bound by these Terms. If you do not agree, you may not use our services. We reserve the right to update these terms at any time.</p>
            </section>

            <section className="space-y-6">
                <h2 className="text-3xl font-black italic tracking-tight">2. User Account</h2>
                <p>To use certain features of the service, you must create an account. You represent and warrant that the information you provide is accurate and complete. You are responsible for maintaining the confidentiality of your account password.</p>
            </section>

            <section className="space-y-6">
                <h2 className="text-3xl font-black italic tracking-tight">3. Orders and Payments</h2>
                <p>All orders placed through our service are subject to acceptance by us. Pricing for products is subject to change. We reserve the right to cancel or refuse any order at our discretion.</p>
            </section>

            <section className="space-y-6">
                <h2 className="text-3xl font-black italic tracking-tight">4. Limitation of Liability</h2>
                <p>AstharHat shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services or for cost of procurement of substitute goods.</p>
            </section>
        </PolicyLayout>
    );
}
