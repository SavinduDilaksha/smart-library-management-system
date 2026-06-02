import StaffSidebar from '@/components/sidebar/StaffSidebar';
import TopHeader from '@/components/navbar/TopHeader';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <StaffSidebar />
      <div className="main-content">
        <TopHeader role="staff" />
        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  );
}
