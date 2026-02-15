"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Channel, DirectMessage, Message, Task, User, ViewType, WorkspaceState, Attachment, UserRole, AppNotification } from "@/types";
import { socket } from "@/lib/websocket/socket";

interface WorkspaceContextType extends WorkspaceState {
  setActiveView: (view: ViewType) => void;
  setActiveChannel: (channelId: string) => void;
  setActiveDm: (dmId: string) => void;
  setSelectedTaskId: (taskId: string | undefined) => void;
  setHighlightedMessageId: (messageId: string | undefined) => void;
  sendMessage: (content: string, attachments?: Attachment[]) => void;
  createChannel: (name: string, description?: string, type?: "public" | "private") => void;
  markChannelRead: (channelId: string) => void;
  updateTaskStatus: (taskId: string, newStatus: "todo" | "in_progress" | "done") => void;
  createTask: (task: Omit<Task, "id" | "creatorId" | "createdAt" | "progress">) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  addTaskComment: (taskId: string, content: string) => void;
  deleteChannel: (channelId: string) => void;
  deleteMessage: (messageId: string) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  updateStatus: (status: "online" | "busy" | "offline") => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  showNotification: (notification: Omit<AppNotification, "id">) => void;
  removeNotification: (id: string) => void;
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
    currentUser: { id: "", name: "", email: "", status: "offline", role: "staff" },
    users: [],
    channels: [],
    dms: [],
    messages: [],
    tasks: [],
    activeView: "channel",
    activeChannelId: "",
    selectedTaskId: undefined,
    highlightedMessageId: undefined,
    notifications: [],
    typingUsers: {},
  });

  useEffect(() => {
    if (session?.user?.email) {
      const token = (session.user as any).accessToken;
      socket.connect({ email: session.user.email, token });

      // Use session data to set currentUser temporarily until full user list sync
      if (session.user) {
        const sessionUser: User = {
          id: (session.user as any).id || "unknown",
          name: session.user.name || "Unknown",
          email: session.user.email,
          avatar: session.user.image || undefined,
          status: "online",
          // Normalize role to lowercase and provide fallback for David
          role: (session.user.email === 'david@stacklevest.com' || session.user.email === 'abutankokingdavid@stacklevest.com')
            ? 'admin'
            : (((session.user as any).role || "staff").toLowerCase() as UserRole),
          needsOnboarding: (session.user as any).needsOnboarding,
          jobTitle: (session.user as any).jobTitle,
          reportingManager: (session.user as any).reportingManager,
          staffNumber: (session.user as any).staffNumber,
          department: (session.user as any).department
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
        const message = data.payload as Message;
        setState((prev) => {
          if (prev.messages.some((m) => m.id === message.id)) {
            return prev;
          }

          // Handle unread counts
          let updatedChannels = prev.channels;
          let updatedDms = prev.dms;

          const isCurrentChannel = prev.activeView === "channel" && prev.activeChannelId === message.channelId;
          const isCurrentDm = prev.activeView === "dm" && prev.activeDmId === message.dmId;
          const isFromSelf = message.senderId === prev.currentUser.id;

          if (!isFromSelf) {
            showNotification({
              title: `New message from ${message.user?.name || 'Someone'}`,
              message: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
              type: "info"
            });

            if (message.channelId && !isCurrentChannel) {
              updatedChannels = prev.channels.map(c =>
                c.id === message.channelId ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c
              );
            } else if (message.dmId && !isCurrentDm) {
              // Ensure DM exists in list
              const existingDm = prev.dms.find(d => d.id === message.dmId);
              if (!existingDm) {
                const senderUser = prev.users.find(u => u.id === message.senderId);
                if (senderUser) {
                  updatedDms = [
                    ...prev.dms,
                    {
                      id: message.dmId!,
                      user: senderUser,
                      unreadCount: 1,
                      lastMessage: message.content
                    }
                  ];
                }
              } else {
                updatedDms = prev.dms.map(d =>
                  d.id === message.dmId ? { ...d, unreadCount: (d.unreadCount || 0) + 1, lastMessage: message.content } : d
                );
              }
            }

            // Show browser notification if enabled and tab is hidden
            if (Notification.permission === "granted" && document.hidden) {
              new Notification(`New message from ${message.user?.name || 'Someone'}`, {
                body: message.content,
                icon: "/favicon.ico"
              });
            }
          } else if (message.dmId) {
            // If from self and DM, ensure DM exists in list
            const existingDm = prev.dms.find(d => d.id === message.dmId);
            if (!existingDm) {
              // For self messages, dmId is usually the recipient ID
              const recipientUser = prev.users.find(u => u.id === message.dmId);
              if (recipientUser) {
                updatedDms = [
                  ...prev.dms,
                  {
                    id: message.dmId!,
                    user: recipientUser,
                    unreadCount: 0,
                    lastMessage: message.content
                  }
                ];
              }
            } else {
              updatedDms = prev.dms.map(d =>
                d.id === message.dmId ? { ...d, lastMessage: message.content } : d
              );
            }
          }

          return {
            ...prev,
            messages: [...prev.messages, message],
            channels: updatedChannels,
            dms: updatedDms
          };
        });
      } else if (data.type === 'message_updated') {
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map(m => m.id === data.payload.id ? data.payload : m)
        }));
      } else if (data.type === 'refresh') {
        // Handle refresh event from backend
        const { type, payload } = data.payload;
        if (type === 'task_updated') {
          setState((prev) => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === payload.id ? payload : t)
          }));
        } else if (type === 'user_updated') {
          setState((prev) => ({
            ...prev,
            users: prev.users.map(u => u.id === payload.id ? payload : u),
            currentUser: prev.currentUser.id === payload.id ? payload : prev.currentUser
          }));
        }
      } else if (data.type === 'message_deleted') {
        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter(m => m.id !== data.payload.messageId)
        }));
      } else if (data.type === 'history') {
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages.filter(m => {
            // Keep messages that aren't in the new history payload to avoid duplicates
            // and keep messages from other channels/DMs
            const inHistory = (data.payload as Message[]).some(newMsg => newMsg.id === m.id);
            return !inHistory;
          }), ...(data.payload as Message[])]
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
        setState((prev) => {
          const updatedUsers = (data.payload as User[]).map((u: User) => ({
            ...u,
            role: (u.role || "staff").toLowerCase() as UserRole
          }));

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
        const task = data.payload as Task;
        showNotification({
          title: "New Task",
          message: `Task "${task.title}" has been created`,
          type: "info"
        });
        setState((prev) => ({
          ...prev,
          tasks: [...prev.tasks, data.payload]
        }));
      } else if (data.type === 'task_updated') {
        const task = data.payload as Task;
        const oldTask = state.tasks.find(t => t.id === task.id);
        if (oldTask && oldTask.status !== task.status) {
          showNotification({
            title: "Task Updated",
            message: `Task "${task.title}" is now ${task.status}`,
            type: "info"
          });
        }
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === task.id ? task : t)
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
    setState((prev) => {
      const existingDm = prev.dms.find((d) => d.id === dmId);
      let updatedDms = prev.dms;

      if (!existingDm) {
        // Find the user to create a DM entry
        const user = prev.users.find((u) => u.id === dmId);
        if (user) {
          updatedDms = [
            ...prev.dms,
            {
              id: dmId,
              user,
              unreadCount: 0,
            },
          ];
        }
      } else {
        updatedDms = prev.dms.map((d) =>
          d.id === dmId ? { ...d, unreadCount: 0 } : d
        );
      }

      // Check if we already have messages for this DM
      const hasMessages = prev.messages.some(m => m.dmId === dmId);
      if (!hasMessages) {
        socket.emit("request_history", { dmId });
      }

      return {
        ...prev,
        activeView: "dm",
        activeDmId: dmId,
        dms: updatedDms,
      };
    });
  };

  const setSelectedTaskId = (taskId: string | undefined) => {
    setState((prev) => ({ ...prev, selectedTaskId: taskId }));
  };

  const setHighlightedMessageId = (messageId: string | undefined) => {
    setState((prev) => ({ ...prev, highlightedMessageId: messageId }));
    if (messageId) {
      setTimeout(() => {
        setState((prev) => ({ ...prev, highlightedMessageId: undefined }));
      }, 3000);
    }
  };

  const showNotification = (notification: Omit<AppNotification, "id">) => {
    const id = Math.random().toString(36).substring(7);
    const newNotification: AppNotification = { ...notification, id };
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }));

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  };

  const sendMessage = (content: string, attachments: Attachment[] = []) => {
    const dmId = state.activeView === "dm" ? state.activeDmId : undefined;
    const channelId = state.activeView === "channel" ? state.activeChannelId : undefined;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: state.currentUser.id,
      timestamp: new Date().toISOString(),
      attachments,
      channelId,
      dmId,
    };

    socket.send({ type: 'message', payload: newMessage });

    // If it's a DM, ensure the DM entry exists in the sidebar for the sender too
    if (dmId) {
      setState(prev => {
        const existingDm = prev.dms.find(d => d.id === dmId);
        if (!existingDm) {
          const recipientUser = prev.users.find(u => u.id === dmId);
          if (recipientUser) {
            return {
              ...prev,
              dms: [
                ...prev.dms,
                {
                  id: dmId,
                  user: recipientUser,
                  unreadCount: 0,
                  lastMessage: content
                }
              ]
            };
          }
        }
        return prev;
      });
    }
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

  const createTask = (taskData: Omit<Task, "id" | "creatorId" | "createdAt" | "progress">) => {
    const newTask = {
      ...taskData,
      id: Math.random().toString(36).substring(7),
      creatorId: state.currentUser.id,
      progress: taskData.status === "done" ? 100 : 0,
      createdAt: new Date().toISOString()
    };
    socket.emit("create_task", newTask);
    setState(prev => ({
      ...prev,
      tasks: [newTask as Task, ...prev.tasks]
    }));
  };

  const updateTask = (task: Task) => {
    socket.emit("update_task", task);
  };

  const deleteTask = (taskId: string) => {
    socket.emit("delete_task", { taskId });
  };

  const addTaskComment = (taskId: string, content: string) => {
    socket.emit("add_task_comment", { taskId, content, userId: state.currentUser.id });
  };

  const deleteChannel = (channelId: string) => {
    socket.emit("delete_channel", { channelId });
  };

  const deleteMessage = (messageId: string) => {
    socket.emit("delete_message", { messageId });
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    socket.emit("reaction", { messageId, emoji });
  };

  const updateStatus = (status: "online" | "busy" | "offline") => {
    socket.emit("update_status", { status });
    setState(prev => ({
      ...prev,
      currentUser: { ...prev.currentUser, status }
    }));
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!state.currentUser.id) return;

    try {
      const response = await fetch(`http://localhost:8082/api/users/${state.currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedUser = await response.json();
      setState(prev => ({
        ...prev,
        currentUser: updatedUser,
        users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
      }));
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const login = (email: string) => {
    // Deprecated in favor of NextAuth, but kept for interface compatibility if needed
    // Logic should rely on session now
    return null;
  };

  const contextValue = React.useMemo(() => ({
    ...state,
    setActiveView,
    setActiveChannel,
    setActiveDm,
    setSelectedTaskId,
    setHighlightedMessageId,
    sendMessage,
    createChannel,
    markChannelRead,
    updateTaskStatus,
    createTask,
    updateTask,
    deleteTask,
    addTaskComment,
    deleteChannel,
    deleteMessage,
    toggleReaction,
    updateStatus,
    updateProfile,
    showNotification,
    removeNotification,
    login,
    startTyping,
    stopTyping,
    isConnected,
  }), [state, isConnected]);

  return (
    <WorkspaceContext.Provider value={contextValue}>
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
