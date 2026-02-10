export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "online" | "offline" | "busy";
  role?: "admin" | "manager" | "member";
  needsOnboarding?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  type: "public" | "private";
  description?: string;
  unreadCount?: number;
}

export interface DirectMessage {
  id: string; // usually the other user's ID or a conversation ID
  user: User;
  lastMessage?: string;
  unreadCount?: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "pdf" | "doc";
  url: string;
  size: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  channelId?: string; // if in channel
  dmId?: string; // if in DM
  timestamp: string;
  attachments?: Attachment[];
}

export interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  assigneeIds: string[];
  dueDate: string;
  priority: "high" | "medium" | "low";
  description?: string;
  channelId?: string;
  progress?: number;
}

export type ViewType = "channel" | "dm" | "tasks" | "assigned_to_me";

export interface WorkspaceState {
  currentUser: User;
  users: User[];
  channels: Channel[];
  dms: DirectMessage[];
  messages: Message[];
  tasks: Task[];
  activeView: ViewType;
  activeChannelId?: string;
  activeDmId?: string;
  typingUsers?: { [key: string]: string[] }; // channelId/dmId -> [userIds]
}
