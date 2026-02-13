"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Shield, 
  ArrowLeft,
  ChevronDown,
  CheckSquare,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/features/workspace/context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";

export function AdminSidebar() {
  const pathname = usePathname();
  const { currentUser } = useWorkspace();

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
      title: "Task Management",
      href: "/admin/tasks",
      icon: CheckSquare
    },
    {
      title: "Task Archive",
      href: "/admin/archive",
      icon: History
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
           <h1 className="font-bold text-slate-900 text-lg mb-1">Admin Console</h1>
           <Logo width={100} height={30} />
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
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Avatar className="w-9 h-9 border border-slate-200">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback className="bg-slate-200 text-slate-600 font-medium">
                {currentUser?.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className={cn(
              "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-50",
              currentUser?.status === "online" ? "bg-green-500" :
              currentUser?.status === "busy" ? "bg-red-500" : "bg-slate-300"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {currentUser?.name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {currentUser?.email}
            </p>
          </div>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" className="w-full justify-start gap-2 text-slate-600 bg-white">
            <ArrowLeft className="w-4 h-4" />
            Back to Workspace
          </Button>
        </Link>
      </div>
    </div>
  );
}
