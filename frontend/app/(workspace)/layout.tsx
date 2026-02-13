import { Sidebar } from "@/components/layout/Sidebar";
import { NotificationCenter } from "@/components/layout/NotificationCenter";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-white text-slate-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
      
      <NotificationCenter />
    </div>
  );
}
