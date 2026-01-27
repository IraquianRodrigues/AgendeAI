import { AppHeader } from "./_components/app-header";
import { AppSidebar } from "./_components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main Content Area - margin will be adjusted by CSS based on sidebar state */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64 transition-all duration-300 ease-in-out [.sidebar-collapsed_&]:md:ml-20">
        <AppHeader />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-2 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
