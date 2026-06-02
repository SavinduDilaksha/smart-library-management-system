import UserSidebar from '@/components/sidebar/UserSidebar';
import TopHeader from '@/components/navbar/TopHeader';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <UserSidebar />
      <div className="main-content">
        <TopHeader role="user" />
        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  );
}
