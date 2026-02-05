"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Shield, 
  ArrowLeft,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Overview",
      href: "/admin",
      icon: LayoutDashboard
    },
    {
      title: "User Management",
      href: "/admin/users",
      icon: Users
    },
    {
      title: "Integrations",
      href: "/admin/integrations",
      icon: Settings
    },
    {
      title: "Security",
      href: "/admin/security",
      icon: Shield
    }
  ];

  return (
    <div className="w-[260px] flex-shrink-0 bg-white flex flex-col h-full border-r border-slate-200 text-slate-900">
      {/* Admin Header */}
      <div className="h-16 px-6 flex items-center border-b border-slate-100">
        <div className="flex flex-col">
           <h1 className="font-bold text-slate-900 text-lg">Admin Console</h1>
           <span className="text-xs text-slate-500">StackleVest Work</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-1",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-blue-700" : "text-slate-400")} />
                {item.title}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer / Back to Workspace */}
      <div className="p-4 border-t border-slate-200">
        <Link href="/dashboard">
          <Button variant="outline" className="w-full justify-start gap-2 text-slate-600">
            <ArrowLeft className="w-4 h-4" />
            Back to Workspace
          </Button>
        </Link>
      </div>
    </div>
  );
}
