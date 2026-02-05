"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Channel, DirectMessage, Message, Task, User, ViewType, WorkspaceState, Attachment } from "@/types";
import { INITIAL_STATE } from "@/lib/mock-data";
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
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(INITIAL_STATE);

  useEffect(() => {
    socket.connect();

    const unsubscribe = socket.subscribe((messageData: unknown) => {
      const data = messageData as { type: string; payload: any };
      if (data.type === 'message') {
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
      }
    });

    return () => {
      unsubscribe();
      socket.disconnect();
    };
  }, []);

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

  const createChannel = (name: string, description: string = "New channel", type: "public" | "private" = "public") => {
    const newChannel: Channel = {
      id: Date.now().toString(),
      name,
      type,
      unreadCount: 0,
      description,
    };
    setState((prev) => ({
      ...prev,
      channels: [...prev.channels, newChannel],
      activeView: "channel",
      activeChannelId: newChannel.id,
    }));
  };
  
  const markChannelRead = (channelId: string) => {
      setState((prev) => ({
          ...prev,
          channels: prev.channels.map(c => c.id === channelId ? { ...c, unreadCount: 0 } : c)
      }));
  };

  const updateTaskStatus = (taskId: string, newStatus: "todo" | "in_progress" | "done") => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ),
    }));
  };

  const createTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
    };
    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  const updateTask = (task: Task) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === task.id ? task : t)),
    }));
  };

  const deleteTask = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  const deleteChannel = (channelId: string) => {
    setState((prev) => {
      const newChannels = prev.channels.filter((c) => c.id !== channelId);
      const isActive = prev.activeChannelId === channelId;
      
      return {
        ...prev,
        channels: newChannels,
        activeChannelId: isActive ? (newChannels[0]?.id || "") : prev.activeChannelId,
        activeView: isActive && newChannels.length === 0 ? "tasks" : prev.activeView
      };
    });
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
