"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/features/workspace/context";
import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    // Strict access control: Only 'admin' role allowed
    const isDavid = currentUser?.email === 'david@stacklevest.com' || currentUser?.email === 'abutankokingdavid@stacklevest.com';
    const isAdmin = currentUser?.role?.toLowerCase() === 'admin' || isDavid;

    if (!currentUser || !isAdmin) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  // Prevent rendering protected content for unauthorized users
  const isDavid = currentUser?.email === 'david@stacklevest.com' || currentUser?.email === 'abutankokingdavid@stacklevest.com';
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin' || isDavid;

  if (!currentUser || !isAdmin) {
    return null; 
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
