"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Channel, DirectMessage, Message, Task, User, ViewType, WorkspaceState, Attachment } from "@/types";
import { socket } from "@/lib/websocket/socket";

interface WorkspaceContextType extends WorkspaceState {
  setActiveView: (view: ViewType) => void;
  setActiveChannel: (channelId: string) => void;
  setActiveDm: (dmId: string) => void;
  sendMessage: (content: string, attachments?: Attachment[]) => void;
  createChannel: (name: string, description?: string, type?: "public" | "private") => void;
  markChannelRead: (channelId: string) => void;
  updateTaskStatus: (taskId: string, newStatus: "todo" | "in_progress" | "done") => void;
  createTask: (task: Omit<Task, "id">) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  deleteChannel: (channelId: string) => void;
  login: (email: string) => User | null;
  startTyping: () => void;
  stopTyping: () => void;
  isConnected: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [state, setState] = useState<WorkspaceState>({
    currentUser: { id: "", name: "", email: "", status: "offline", role: "member" },
    users: [],
    channels: [],
    dms: [],
    messages: [],
    tasks: [],
    activeView: "channel",
    activeChannelId: "",
    typingUsers: {},
  });

  useEffect(() => {
    if (session?.user?.email) {
        socket.connect({ email: session.user.email });
        
        // Use session data to set currentUser temporarily until full user list sync
        if (session.user) {
             const sessionUser: User = {
                id: (session.user as any).id || "unknown",
                name: session.user.name || "Unknown",
                email: session.user.email,
                avatar: session.user.image || undefined,
                status: "online",
                // Force admin role for David as a fallback
                role: session.user.email === 'david@stacklevest.com' ? 'admin' : ((session.user as any).role || "member"),
                needsOnboarding: (session.user as any).needsOnboarding
            };
            setState(prev => ({ ...prev, currentUser: sessionUser }));
        }

        // Request latest state
        socket.emit("request_refresh", {});
    }

    const unsubscribe = socket.subscribe((messageData: unknown) => {
      const data = messageData as { type: string; payload: any };
      
      if (data.type === 'connect') {
          setIsConnected(true);
      } else if (data.type === 'disconnect') {
          setIsConnected(false);
      } else if (data.type === 'message') {
        const message = data.payload;
        setState((prev) => {
          if (prev.messages.some((m) => m.id === message.id)) {
            return prev;
          }
          return {
            ...prev,
            messages: [...prev.messages, message],
          };
        });
      } else if (data.type === 'history') {
         setState((prev) => ({
             ...prev,
             messages: data.payload
         }));
      } else if (data.type === 'channels') {
         setState((prev) => {
             const channels = data.payload as Channel[];
             // Set first channel as active if none selected and we have channels
             const newActiveId = prev.activeChannelId || (channels.length > 0 ? channels[0].id : "");
             
             return {
                ...prev,
                channels: channels,
                activeChannelId: newActiveId
             };
         });
      } else if (data.type === 'channel_created') {
         setState((prev) => ({
             ...prev,
             channels: [...prev.channels, data.payload]
         }));
      } else if (data.type === 'channel_deleted') {
         setState((prev) => {
             const newChannels = prev.channels.filter(c => c.id !== data.payload.channelId);
             const wasActive = prev.activeView === 'channel' && prev.activeChannelId === data.payload.channelId;
             
             return {
                 ...prev,
                 channels: newChannels,
                 activeChannelId: wasActive ? (newChannels[0]?.id || "") : prev.activeChannelId,
                 activeView: wasActive && newChannels.length === 0 ? "tasks" : prev.activeView
             };
         });
      } else if (data.type === 'users') {
         const updatedUsers = data.payload as User[];
         setState((prev) => {
             // Sync currentUser with the latest data if they exist in the list
             let updatedCurrentUser = prev.currentUser;
             if (prev.currentUser?.email) {
                 // Try to match by Email (more reliable than ID if session ID is missing)
                 const foundUser = updatedUsers.find(u => u.email.toLowerCase() === prev.currentUser.email.toLowerCase());
                 if (foundUser) {
                     updatedCurrentUser = { ...prev.currentUser, ...foundUser };
                 }
             } else if (prev.currentUser?.id) {
                 // Fallback to ID
                 const foundUser = updatedUsers.find(u => u.id === prev.currentUser.id);
                 if (foundUser) {
                     updatedCurrentUser = { ...prev.currentUser, ...foundUser };
                 }
             }
             
             return {
                 ...prev,
                 users: updatedUsers,
                 currentUser: updatedCurrentUser
             };
         });
      } else if (data.type === 'tasks') {
        setState((prev) => ({
             ...prev,
             tasks: data.payload
        }));
      } else if (data.type === 'task_created') {
        setState((prev) => ({
             ...prev,
             tasks: [...prev.tasks, data.payload]
        }));
      } else if (data.type === 'task_updated') {
        setState((prev) => ({
             ...prev,
             tasks: prev.tasks.map(t => t.id === data.payload.id ? data.payload : t)
        }));
      } else if (data.type === 'task_deleted') {
        setState((prev) => ({
             ...prev,
             tasks: prev.tasks.filter(t => t.id !== data.payload)
        }));
      } else if (data.type === 'user_status_change') {
         const { userId, status } = data.payload;
         setState(prev => ({
             ...prev,
             users: prev.users.map(u => u.id === userId ? { ...u, status } : u),
             // Update DMs as well
             dms: prev.dms.map(dm => dm.user.id === userId ? { ...dm, user: { ...dm.user, status } } : dm)
         }));
      } else if (data.type === 'typing_start') {
        const { userId, channelId, dmId } = data.payload;
        const key = channelId || dmId;
        if (!key) return;

        setState(prev => {
            const currentTypers = prev.typingUsers?.[key] || [];
            if (currentTypers.includes(userId)) return prev;
            return {
                ...prev,
                typingUsers: {
                    ...prev.typingUsers,
                    [key]: [...currentTypers, userId]
                }
            };
        });
      } else if (data.type === 'typing_stop') {
        const { userId, channelId, dmId } = data.payload;
        const key = channelId || dmId;
        if (!key) return;

        setState(prev => {
            const currentTypers = prev.typingUsers?.[key] || [];
            return {
                ...prev,
                typingUsers: {
                    ...prev.typingUsers,
                    [key]: currentTypers.filter(id => id !== userId)
                }
            };
        });
      }
    });

    return () => {
      unsubscribe();
      socket.disconnect();
    };
  }, [session]);

  const setActiveView = (view: ViewType) => {
    setState((prev) => ({ ...prev, activeView: view }));
  };

  const setActiveChannel = (channelId: string) => {
    setState((prev) => ({
      ...prev,
      activeView: "channel",
      activeChannelId: channelId,
      // Clear unread count
      channels: prev.channels.map((c) =>
        c.id === channelId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  };

  const setActiveDm = (dmId: string) => {
    setState((prev) => ({
      ...prev,
      activeView: "dm",
      activeDmId: dmId,
      // Clear unread count
      dms: prev.dms.map((d) =>
        d.id === dmId ? { ...d, unreadCount: 0 } : d
      ),
    }));
  };

  const sendMessage = (content: string, attachments: Attachment[] = []) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: state.currentUser.id,
      timestamp: new Date().toISOString(),
      attachments,
      channelId: state.activeView === "channel" ? state.activeChannelId : undefined,
      dmId: state.activeView === "dm" ? state.activeDmId : undefined,
    };

    socket.send({ type: 'message', payload: newMessage });
  };

  // Add Typing Handlers
  const startTyping = () => {
    socket.send({ 
        type: 'typing_start', 
        payload: { 
            channelId: state.activeView === "channel" ? state.activeChannelId : undefined,
            dmId: state.activeView === "dm" ? state.activeDmId : undefined
        } 
    });
  };

  const stopTyping = () => {
    socket.send({ 
        type: 'typing_stop', 
        payload: { 
            channelId: state.activeView === "channel" ? state.activeChannelId : undefined,
            dmId: state.activeView === "dm" ? state.activeDmId : undefined
        } 
    });
  };

  const createChannel = (name: string, description: string = "New channel", type: "public" | "private" = "public") => {
    socket.emit("create_channel", { name, description, type });
  };
  
  const markChannelRead = (channelId: string) => {
      setState((prev) => ({
          ...prev,
          channels: prev.channels.map(c => c.id === channelId ? { ...c, unreadCount: 0 } : c)
      }));
  };

  const updateTaskStatus = (taskId: string, newStatus: "todo" | "in_progress" | "done") => {
    socket.emit("update_task_status", { taskId, status: newStatus });
  };

  const createTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
    };
    socket.emit("create_task", newTask);
  };

  const updateTask = (task: Task) => {
    socket.emit("update_task", task);
  };

  const deleteTask = (taskId: string) => {
    socket.emit("delete_task", taskId);
  };

  const deleteChannel = (channelId: string) => {
    socket.emit("delete_channel", { channelId });
  };

  const login = (email: string) => {
    // Deprecated in favor of NextAuth, but kept for interface compatibility if needed
    // Logic should rely on session now
    return null;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        ...state,
        setActiveView,
        setActiveChannel,
        setActiveDm,
        sendMessage,
        createChannel,
        markChannelRead,
        updateTaskStatus,
        createTask,
        updateTask,
        deleteTask,
        deleteChannel,
        login,
        startTyping,
        stopTyping,
        isConnected,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
