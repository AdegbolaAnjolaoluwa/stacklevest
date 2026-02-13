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
    <div className="w-[260px] flex-shrink-0 bg-white flex flex-col h-full border-r border-slate-100 text-slate-900">
      {/* Workspace Header */}
      <div className="h-20 px-6 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Shield className="w-5 h-5 text-white fill-white/20" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 font-fredoka">StackleVest</span>
        </div>
      </div>

      {/* New Message Button */}
      <div className="px-6 mb-6">
        <Button 
          className="w-full h-11 justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 font-semibold rounded-xl"
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
                 <div className="w-full px-3 py-2 flex items-center gap-3 rounded-lg group transition-colors text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                   <Shield className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
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
                "w-full px-3 py-2 flex items-center justify-between rounded-lg group transition-colors text-sm font-medium",
                activeView === "tasks"
                  ? "bg-slate-50 text-slate-900" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={cn("w-4 h-4", activeView === "tasks" ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                <span>Task Hub</span>
              </div>
              {totalTasksCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
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
                className="w-5 h-5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all"
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
                    "w-full px-3 py-2 flex items-center justify-between rounded-lg group transition-colors text-sm font-medium cursor-pointer",
                    activeView === "channel" && activeChannelId === channel.id
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  onClick={() => handleSelectChannel(channel)}
                >
                  <div className="flex items-center gap-3 truncate flex-1">
                    <Hash className={cn("w-4 h-4 flex-shrink-0", activeView === "channel" && activeChannelId === channel.id ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                    <span className="truncate">{channel.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {channel.unreadCount ? (
                      <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {channel.unreadCount}
                      </span>
                    ) : null}

                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
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
                className="w-5 h-5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md opacity-0 group-hover:opacity-100 transition-all"
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
                    "w-full px-3 py-2 flex items-center justify-between rounded-lg group transition-colors text-sm font-medium cursor-pointer",
                    activeView === "dm" && activeDmId === dm.id
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
      <div className="p-4 border-t border-slate-100 bg-white">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2.5 rounded-xl transition-all group">
              <div className="relative shrink-0">
                <Avatar className="w-10 h-10 border border-slate-100 shadow-sm">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback className="bg-blue-50 text-blue-700 font-bold">
                    {currentUser?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                  currentUser?.status === "online" ? "bg-green-500" :
                  currentUser?.status === "busy" ? "bg-red-500" : "bg-slate-300"
                )} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {currentUser?.name || "Loading..."}
                </p>
                <p className="text-[11px] text-slate-500 truncate font-medium">
                  {currentUser?.email || "Please wait..."}
                </p>
              </div>
              <MoreHorizontal className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
            <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
              <p className="text-xs font-semibold text-slate-500">Signed in as</p>
              <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.email}</p>
            </div>
            <div className="px-1 py-1 border-b border-slate-100 mb-1">
              <DropdownMenuItem 
                className="cursor-pointer flex items-center justify-between"
                onClick={() => updateStatus("online")}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  <span>Online</span>
                </div>
                {currentUser?.status === "online" && <Check className="w-4 h-4 text-blue-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer flex items-center justify-between"
                onClick={() => updateStatus("busy")}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  <span>Busy</span>
                </div>
                {currentUser?.status === "busy" && <Check className="w-4 h-4 text-blue-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer flex items-center justify-between"
                onClick={() => updateStatus("offline")}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-slate-300 mr-2" />
                  <span>Offline</span>
                </div>
                {currentUser?.status === "offline" && <Check className="w-4 h-4 text-blue-600" />}
              </DropdownMenuItem>
            </div>
            <DropdownMenuItem className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer mt-1 border-t border-slate-100 pt-2"
              onClick={() => signOut({ callbackUrl: '/signed-out' })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
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
