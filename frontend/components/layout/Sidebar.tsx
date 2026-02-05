"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Hash, 
  Plus, 
  ChevronDown,
  ChevronRight,
  SquarePen,
  CheckCircle2,
  User,
  Users,
  Trash2,
  MoreHorizontal,
  Shield
} from "lucide-react";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/features/workspace/context";
import { CreateChannelDialog } from "@/components/channels/create-channel-dialog";
import { DeleteChannelDialog } from "@/components/channels/delete-channel-dialog";

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
    currentUser
  } = useWorkspace();
  
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState("");
  
  // Section toggle states
  const [isChannelsOpen, setIsChannelsOpen] = useState(true);
  const [isDmsOpen, setIsDmsOpen] = useState(true);
  const [isTasksOpen, setIsTasksOpen] = useState(true);

  const handleNewMessage = () => {
     // For now, this just closes the modal. 
     // In a real app, this would find the user/channel and navigate to it.
     setIsNewMessageOpen(false);
     setMessageRecipient("");
  };

  return (
    <div className="w-[260px] flex-shrink-0 bg-slate-50 flex flex-col h-full border-r border-slate-200 text-slate-900">
      {/* Workspace Header */}
      <div className="h-16 px-4 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer">
        <div className="flex flex-col">
           <div className="flex items-center gap-1">
              <h1 className="font-bold text-slate-900 text-sm">StackleVest Work</h1>
              <ChevronDown className="w-3 h-3 text-slate-500" />
           </div>
           <span className="text-xs text-slate-500">Pro Plan</span>
        </div>
      </div>

      {/* New Message Button */}
      <div className="px-4 mb-6">
        <Button 
          className="w-full justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold"
          onClick={() => setIsNewMessageOpen(true)}
        >
          <SquarePen className="w-4 h-4" />
          New Message
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-8 pb-4">
          
          {/* Admin Link */}
          {currentUser?.role === 'admin' && (
            <div>
               <Link href="/admin">
                 <div className="w-full px-2 py-1.5 flex items-center gap-3 rounded-md group transition-colors text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                   <Shield className="w-4 h-4" />
                   <span>Admin Console</span>
                 </div>
               </Link>
            </div>
          )}

          {/* Tasks Section */}
          <div>
            <div className="px-2 mb-2 flex items-center justify-between group">
               <button 
                onClick={() => setIsTasksOpen(!isTasksOpen)}
                className="flex items-center gap-1 hover:text-slate-700 transition-colors"
               >
                 <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                   Tasks
                 </h2>
               </button>
            </div>
            {isTasksOpen && (
              <div className="space-y-0.5">
                <button 
                  onClick={() => setActiveView("tasks")}
                  className={cn(
                    "w-full px-3 py-1.5 flex items-center gap-3 rounded-md group transition-colors text-sm font-medium",
                    activeView === "tasks"
                      ? "bg-transparent text-slate-900 font-semibold" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <CheckCircle2 className={cn("w-4 h-4", activeView === "tasks" ? "text-slate-900" : "text-slate-400")} />
                  <span>My Tasks</span>
                </button>
                <button 
                  onClick={() => setActiveView("assigned_to_me")}
                  className={cn(
                    "w-full px-3 py-1.5 flex items-center gap-3 rounded-md group transition-colors text-sm font-medium",
                    activeView === "assigned_to_me"
                      ? "bg-transparent text-slate-900 font-semibold" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <User className={cn("w-4 h-4", activeView === "assigned_to_me" ? "text-slate-900" : "text-slate-400")} />
                  <span>Assigned to Me</span>
                </button>
              </div>
            )}
          </div>

          {/* Channels Section */}
          <div>
            <div className="px-2 mb-2 flex items-center justify-between group">
              <button 
                onClick={() => setIsChannelsOpen(!isChannelsOpen)}
                className="flex items-center gap-1 hover:text-slate-700 transition-colors"
              >
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Channels
                </h2>
              </button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-4 h-4 text-slate-400 hover:text-slate-700 transition-colors"
                onClick={() => setIsChannelDialogOpen(true)}
              >
                <Plus className="w-3 h-3" />
              </Button>
              <CreateChannelDialog 
                open={isChannelDialogOpen} 
                onOpenChange={setIsChannelDialogOpen} 
              />
            </div>
            
            {isChannelsOpen && (
            <div className="space-y-0.5">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className={cn(
                    "w-full px-3 py-1.5 flex items-center justify-between rounded-md group transition-colors text-sm font-medium cursor-pointer",
                    activeView === "channel" && activeChannelId === channel.id
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  onClick={() => setActiveChannel(channel.id)}
                >
                  <div className="flex items-center gap-3 truncate flex-1">
                    <Hash className={cn("w-4 h-4 flex-shrink-0", activeView === "channel" && activeChannelId === channel.id ? "text-blue-600" : "text-slate-400")} />
                    <span className="truncate">{channel.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {channel.unreadCount ? (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {channel.unreadCount}
                      </span>
                    ) : null}

                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
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
            )}
          </div>

          {/* Direct Messages Section */}
          <div>
            <div className="px-2 mb-2 flex items-center justify-between group">
              <button 
                onClick={() => setIsDmsOpen(!isDmsOpen)}
                className="flex items-center gap-1 hover:text-slate-700 transition-colors"
              >
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Direct Messages
                </h2>
              </button>
              <Button variant="ghost" size="icon" className="w-4 h-4 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            
            {isDmsOpen && (
            <div className="space-y-0.5">
              {dms.map((dm) => (
                <button
                  key={dm.id}
                  onClick={() => setActiveDm(dm.id)}
                  className={cn(
                    "w-full px-3 py-1.5 flex items-center gap-3 rounded-md group transition-colors text-sm font-medium",
                    activeView === "dm" && activeDmId === dm.id
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <div className="relative">
                    <Avatar className="w-5 h-5 rounded-sm">
                      <AvatarImage src={dm.user.avatar} />
                      <AvatarFallback className="text-[10px] bg-slate-200 text-slate-600 rounded-sm">
                        {dm.user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white",
                      dm.user.status === "online" ? "bg-green-500" :
                      dm.user.status === "busy" ? "bg-red-500" : "bg-slate-300"
                    )} />
                  </div>
                  <span className="truncate flex-1 text-left">{dm.user.name}</span>
                  {dm.unreadCount ? (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {dm.unreadCount}
                    </span>
                  ) : null}
                </button>
              ))}
               {/* Hardcoded "Engineering Team" to match screenshot */}
               <button
                  className="w-full px-3 py-1.5 flex items-center gap-3 rounded-md group transition-colors text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  <div className="w-5 h-5 rounded-sm bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600">
                    ET
                  </div>
                  <span className="truncate flex-1 text-left">Engineering Team</span>
                </button>
            </div>
            )}
          </div>

        </div>
      </ScrollArea>
      
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <Label>To:</Label>
                <Input 
                   placeholder="#channel or @user" 
                   value={messageRecipient}
                   onChange={(e) => setMessageRecipient(e.target.value)}
                />
             </div>
             <div className="space-y-2">
                <Label>Message:</Label>
                <Input placeholder="Type your message..." />
             </div>
          </div>
          <DialogFooter>
             <Button onClick={handleNewMessage}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
