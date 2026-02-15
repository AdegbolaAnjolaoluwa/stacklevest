"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Hash,
  Plus,
  ChevronDown,
  SquarePen,
  CheckCircle2,
  Check,
  User,
  Trash2,
  MoreHorizontal,
  Shield,
  LogOut,
  Settings,
  Bell,
  HelpCircle,
  Search
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/features/workspace/context";
import { CreateChannelDialog } from "@/components/channels/create-channel-dialog";
import { DeleteChannelDialog } from "@/components/channels/delete-channel-dialog";
import { Logo } from "@/components/logo";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Sidebar() {
  const {
    channels,
    dms,
    activeView,
    activeChannelId,
    activeDmId,
    setActiveChannel,
    setActiveDm,
    setActiveView,
    users,
    deleteChannel,
    currentUser,
    updateStatus,
    tasks
  } = useWorkspace();

  const totalTasksCount = tasks.length;

  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Section toggle states
  const [isChannelsOpen, setIsChannelsOpen] = useState(true);
  const [isDmsOpen, setIsDmsOpen] = useState(true);
  const [isTasksOpen, setIsTasksOpen] = useState(true);

  const handleSelectUser = (user: any) => {
    setActiveDm(user.id);
    setIsNewMessageOpen(false);
    setSearchQuery("");
    setActiveView("dm");
  };

  const handleSelectChannel = (channel: any) => {
    setActiveChannel(channel.id);
    setIsNewMessageOpen(false);
    setSearchQuery("");
    setActiveView("channel");
  };

  const filteredUsers = users.filter(u =>
    u.id !== currentUser?.id &&
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-[260px] flex-shrink-0 bg-slate-50/30 dark:bg-background/80 flex flex-col h-full border-r border-slate-200/60 dark:border-white/10 text-slate-900 dark:text-slate-100 backdrop-blur-3xl relative overflow-hidden transition-colors">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      {/* Workspace Header */}
      <div className="h-20 px-6 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white font-fredoka">StackleVest</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 rounded-lg">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 rounded-lg">
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Trigger */}
      <div className="px-6 mb-4">
        <button
          onClick={() => {
            const event = new KeyboardEvent('keydown', {
              key: 'k',
              metaKey: true,
              bubbles: true
            });
            document.dispatchEvent(event);
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all shadow-sm group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          <span className="font-medium">Search anything...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-slate-50 dark:bg-slate-900 px-1.5 font-mono text-[10px] font-medium text-slate-400 dark:text-slate-500 opacity-60">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* New Message Button */}
      <div className="px-6 mb-6">
        <Button
          className="w-full h-11 justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => setIsNewMessageOpen(true)}
        >
          <SquarePen className="w-4 h-4" />
          New Message
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-7 pb-4">

          {/* Admin Link */}
          {(currentUser?.role?.toLowerCase() === 'admin' || currentUser?.email === 'david@stacklevest.com' || currentUser?.email === 'abutankokingdavid@stacklevest.com') && (
            <div>
              <Link href="/admin">
                <div className="w-full px-3 py-2.5 flex items-center gap-3 rounded-xl group transition-all duration-300 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm dark:hover:shadow-none border border-transparent hover:border-slate-100 dark:hover:border-white/10">
                  <Shield className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  <span>Admin Console</span>
                </div>
              </Link>
            </div>
          )}

          {/* Task Hub Section */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveView("tasks")}
              className={cn(
                "w-full px-3 py-2 flex items-center justify-between rounded-lg group transition-all duration-200 text-sm font-medium",
                activeView === "tasks"
                  ? "bg-white shadow-sm text-blue-700 ring-1 ring-slate-100"
                  : "text-slate-600 hover:bg-slate-100/60 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={cn("w-4 h-4 transition-colors", activeView === "tasks" ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                <span>Task Hub</span>
              </div>
              {totalTasksCount > 0 && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center transition-colors",
                  activeView === "tasks" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                )}>
                  {totalTasksCount}
                </span>
              )}
            </button>
          </div>

          {/* Channels Section */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between group">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Channels
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="w-5 h-5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                onClick={() => setIsChannelDialogOpen(true)}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
              <CreateChannelDialog
                open={isChannelDialogOpen}
                onOpenChange={setIsChannelDialogOpen}
              />
            </div>

            <div className="space-y-0.5">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className={cn(
                    "w-full px-3 py-2 flex items-center justify-between rounded-lg group transition-all duration-200 text-sm font-medium cursor-pointer",
                    activeView === "channel" && activeChannelId === channel.id
                      ? "bg-white shadow-sm text-blue-700 ring-1 ring-slate-100"
                      : "text-slate-600 hover:bg-slate-100/60 hover:text-slate-900"
                  )}
                  onClick={() => handleSelectChannel(channel)}
                >
                  <div className="flex items-center gap-3 truncate flex-1">
                    <Hash className={cn("w-4 h-4 flex-shrink-0 transition-colors", activeView === "channel" && activeChannelId === channel.id ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                    <span className="truncate">{channel.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {channel.unreadCount ? (
                      <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm shadow-blue-200">
                        {channel.unreadCount}
                      </span>
                    ) : null}

                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all rounded-md"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleSelectChannel(channel)}
                          >
                            <Hash className="w-4 h-4 mr-2" />
                            Open Channel
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            onClick={() => setChannelToDelete(channel.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Channel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between group">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Direct Messages
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="w-5 h-5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                onClick={() => setIsNewMessageOpen(true)}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-0.5">
              {dms.map((dm) => (
                <div
                  key={dm.id}
                  onClick={() => handleSelectUser(dm.user)}
                  className={cn(
                    "w-full px-3 py-2 flex items-center justify-between rounded-lg group transition-all duration-200 text-sm font-medium cursor-pointer",
                    activeView === "dm" && activeDmId === dm.id
                      ? "bg-white shadow-sm text-blue-700 ring-1 ring-slate-100"
                      : "text-slate-600 hover:bg-slate-100/60 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3 truncate flex-1 text-left">
                    <div className="relative flex-shrink-0">
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm",
                        dm.user.id === 'engineering-team' ? "bg-purple-500" : "bg-slate-400"
                      )}>
                        {dm.user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white",
                        dm.user.status === "online" ? "bg-green-500" :
                          dm.user.status === "busy" ? "bg-red-500" : "bg-slate-300"
                      )} />
                    </div>
                    <span className="truncate">{dm.user.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {dm.unreadCount ? (
                      <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {dm.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </ScrollArea>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-white hover:shadow-md hover:shadow-slate-200/50 p-3 rounded-2xl transition-all duration-200 group border border-transparent hover:border-slate-100">
              <div className="relative shrink-0">
                <Avatar className="w-10 h-10 border-2 border-white dark:border-white/20 shadow-sm ring-1 ring-slate-100 dark:ring-white/10">
                  <AvatarImage src={currentUser?.avatar} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                    {currentUser?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-white dark:border-slate-900 ring-1 ring-slate-100 dark:ring-white/5",
                  currentUser?.status === "online" ? "bg-emerald-500" :
                    currentUser?.status === "busy" ? "bg-red-500" : "bg-slate-300"
                )} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                  {currentUser?.name || "Loading..."}
                </p>
                <p className="text-[10px] font-medium text-slate-500 truncate">
                  {currentUser?.role?.toUpperCase() || "STAFF"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2" sideOffset={8} side="right">
            <div className="px-3 py-3 bg-slate-50 rounded-lg mb-2 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-0.5">Signed in as</p>
              <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  currentUser?.status === "online" ? "bg-emerald-500" :
                    currentUser?.status === "busy" ? "bg-red-500" : "bg-slate-300"
                )} />
                <span className="text-xs font-medium text-slate-600 capitalize">{currentUser?.status || "Offline"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">Status</p>
              <DropdownMenuItem
                className="cursor-pointer flex items-center justify-between rounded-md focus:bg-emerald-50 focus:text-emerald-700"
                onClick={() => updateStatus("online")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-medium">Online</span>
                </div>
                {currentUser?.status === "online" && <Check className="w-4 h-4 text-emerald-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer flex items-center justify-between rounded-md focus:bg-red-50 focus:text-red-700"
                onClick={() => updateStatus("busy")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="font-medium">Busy</span>
                </div>
                {currentUser?.status === "busy" && <Check className="w-4 h-4 text-red-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer flex items-center justify-between rounded-md focus:bg-slate-50 focus:text-slate-700"
                onClick={() => updateStatus("offline")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="font-medium">Offline</span>
                </div>
                {currentUser?.status === "offline" && <Check className="w-4 h-4 text-slate-600" />}
              </DropdownMenuItem>
            </div>

            <div className="my-2 border-t border-slate-100" />

            <div className="space-y-1">
              <Link href="/settings" className="block">
                <DropdownMenuItem className="cursor-pointer gap-3 rounded-md focus:bg-blue-50 focus:text-blue-700">
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Settings</span>
                </DropdownMenuItem>
              </Link>

            </div>

            <div className="my-2 border-t border-slate-100" />

            <DropdownMenuItem
              className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer rounded-md gap-3"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DeleteChannelDialog
        open={!!channelToDelete}
        onOpenChange={(open) => !open && setChannelToDelete(null)}
        onConfirm={() => {
          if (channelToDelete) {
            deleteChannel(channelToDelete);
            setChannelToDelete(null);
          }
        }}
        channelName={channels.find(c => c.id === channelToDelete)?.name}
      />

      {/* New Message Modal */}
      <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-slate-50 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, email or #channel"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white border-slate-200"
                autoFocus
              />
            </div>
          </div>
          <ScrollArea className="h-[350px]">
            <div className="p-2 space-y-4">
              {filteredChannels.length > 0 && (
                <div>
                  <h3 className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Channels
                  </h3>
                  <div className="space-y-0.5">
                    {filteredChannels.map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => handleSelectChannel(channel)}
                        className="w-full px-3 py-2 flex items-center gap-3 rounded-md hover:bg-slate-100 transition-colors text-sm text-slate-700"
                      >
                        <Hash className="w-4 h-4 text-slate-400" />
                        <span>{channel.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredUsers.length > 0 && (
                <div>
                  <h3 className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Users
                  </h3>
                  <div className="space-y-0.5">
                    {filteredUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="w-full px-3 py-2 flex items-center gap-3 rounded-md hover:bg-slate-100 transition-colors text-sm text-slate-700"
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          user.status === "online" ? "bg-green-500" :
                            user.status === "busy" ? "bg-red-500" : "bg-slate-300"
                        )} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredChannels.length === 0 && filteredUsers.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-500">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

    </div>
  );
}
