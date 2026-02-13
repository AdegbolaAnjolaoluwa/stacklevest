export type UserStatus = "online" | "offline" | "busy";
export type UserRole = "admin" | "manager" | "staff";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "high" | "medium" | "low";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: UserStatus;
  role?: UserRole;
  needsOnboarding?: boolean;
  jobTitle?: string;
  reportingManager?: string;
  staffNumber?: string;
  department?: string;
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

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  channelId?: string; // if in channel
  dmId?: string; // if in DM
  timestamp: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assigneeIds: string[];
  creatorId: string;
  dueDate: string;
  priority: TaskPriority;
  description?: string;
  channelId?: string;
  dmId?: string;
  progress?: number;
  completedAt?: string;
  createdAt?: string;
  comments?: TaskComment[];
}

export type ViewType = "channel" | "dm" | "tasks" | "assigned_to_me";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "error";
}

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
  selectedTaskId?: string;
  highlightedMessageId?: string;
  notifications: AppNotification[];
  typingUsers?: { [key: string]: string[] }; // channelId/dmId -> [userIds]
}
