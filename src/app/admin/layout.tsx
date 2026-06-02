import AdminSidebar from '@/components/sidebar/AdminSidebar';
import TopHeader from '@/components/navbar/TopHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <AdminSidebar />
      <div className="main-content">
        <TopHeader role="admin" />
        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  );
}
