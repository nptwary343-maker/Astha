import EmailTemplateManager from '@/components/admin/EmailTemplateManager';
import AdminHeader from '@/components/admin/AdminHeader';

export default function EmailTemplatesPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Email Manager" />
            <main className="flex-1 p-6">
                <EmailTemplateManager />
            </main>
        </div>
    );
}
