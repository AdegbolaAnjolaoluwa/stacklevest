"use client";
import { useState } from "react";
import { useWorkspace } from "@/features/workspace/context";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { Menu, CheckSquare, Hash, User } from "lucide-react";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { 
    activeView, 
    setActiveView, 
    channels, 
    dms, 
    activeChannelId, 
    activeDmId, 
    setActiveChannel, 
    setActiveDm 
  } = useWorkspace();

  return (
    <div className="flex h-screen bg-white text-slate-900">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        <div className="md:hidden flex items-center gap-2 justify-between px-3 py-2 border-b border-slate-200 bg-white">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-600 hover:text-slate-900"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex justify-center">
            <GlobalSearch />
          </div>
          <div className="w-9" />
        </div>
        {children}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-14 flex items-center justify-around">
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-full px-4 ${activeView === "tasks" ? "text-blue-600" : "text-slate-600"}`}
            onClick={() => setActiveView("tasks")}
            aria-label="Tasks"
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[11px] font-medium">Tasks</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-full px-4 ${activeView === "channel" ? "text-blue-600" : "text-slate-600"}`}
            onClick={() => {
              if (!activeChannelId && channels[0]?.id) setActiveChannel(channels[0].id);
              setActiveView("channel");
            }}
            aria-label="Channels"
          >
            <Hash className="w-5 h-5" />
            <span className="text-[11px] font-medium">Channels</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-full px-4 ${activeView === "dm" ? "text-blue-600" : "text-slate-600"}`}
            onClick={() => {
              if (!activeDmId && dms[0]?.id) setActiveDm(dms[0].id);
              setActiveView("dm");
            }}
            aria-label="DMs"
          >
            <User className="w-5 h-5" />
            <span className="text-[11px] font-medium">DMs</span>
          </Button>
        </div>
      </div>
      <NotificationCenter />

      <Dialog open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <DialogContent className="p-0 bg-white border-none shadow-2xl fixed left-0 top-0 h-screen w-[85vw] max-w-[320px] rounded-none">
          <Sidebar />
        </DialogContent>
      </Dialog>
    </div>
  );
}
