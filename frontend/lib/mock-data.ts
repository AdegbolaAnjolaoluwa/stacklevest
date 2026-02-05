import { Channel, DirectMessage, Message, Task, User, WorkspaceState } from "@/types";

export const MOCK_USERS: User[] = [
  { id: "u1", name: "King David Developer", email: "david@stacklevest.com", status: "online", role: "admin", avatar: "https://github.com/shadcn.png" },
  { id: "u2", name: "Karen Marketing", email: "karen@stacklevest.com", status: "online", role: "manager" },
  { id: "u3", name: "John Developer", email: "john@stacklevest.com", status: "busy", role: "member" },
  { id: "u4", name: "Anjola Junior Developer", email: "anjola@stacklevest.com", status: "offline", role: "member" },
];

export const MOCK_CHANNELS: Channel[] = [
  { id: "c1", name: "general", type: "public", description: "Company-wide announcements and chatter", unreadCount: 2 },
  { id: "c2", name: "engineering", type: "public", description: "Engineering team discussions", unreadCount: 0 },
  { id: "c3", name: "finance", type: "private", description: "Financial planning and reports", unreadCount: 5 },
];

export const MOCK_DMS: DirectMessage[] = [
  { id: "dm1", user: MOCK_USERS[1], unreadCount: 1, lastMessage: "Have you seen the new campaign copy?" },
  { id: "dm2", user: MOCK_USERS[2], unreadCount: 0, lastMessage: "Can you help me debug this issue?" },
];

export const MOCK_MESSAGES: Message[] = [];

export const MOCK_TASKS: Task[] = [
  { 
    id: "t1", 
    title: "Q3 Financial Review", 
    status: "todo", 
    assigneeIds: ["u1"], 
    dueDate: "Oct 24", 
    priority: "high",
    description: "Review Q3 financial performance" 
  },
  { 
    id: "t2", 
    title: "Draft Marketing Copy for Q4 Campaign", 
    status: "todo", 
    assigneeIds: ["u2"], 
    dueDate: "Oct 26", 
    priority: "medium",
    description: "Prepare copy for upcoming campaign" 
  },
  { 
    id: "t3", 
    title: "Update Server Config", 
    status: "todo", 
    assigneeIds: ["u1"], 
    dueDate: "Oct 30", 
    priority: "low",
    description: "Update server configuration for better performance" 
  },
  { 
    id: "t4", 
    title: "Onboard New Designer", 
    status: "in_progress", 
    assigneeIds: ["u2", "u4"], 
    dueDate: "Due Today", 
    priority: "high",
    description: "Complete onboarding process for new designer",
    progress: 25
  },
  { 
    id: "t5", 
    title: "Client Feedback Loop", 
    status: "in_progress", 
    assigneeIds: ["u1"], 
    dueDate: "Oct 25", 
    priority: "medium",
    description: "Gather feedback from key clients",
    progress: 50
  },
  { 
    id: "t6", 
    title: "Weekly Sync", 
    status: "done", 
    assigneeIds: ["u1"], 
    dueDate: "Oct 20", 
    priority: "low",
    description: "Weekly team synchronization meeting" 
  },
  { 
    id: "t7", 
    title: "Bug Fix #402", 
    status: "done", 
    assigneeIds: ["u3"], 
    dueDate: "Oct 21", 
    priority: "high",
    description: "Fix critical bug in login flow" 
  },
  { 
    id: "t8", 
    title: "Approve Expenses", 
    status: "done", 
    assigneeIds: ["u3"], 
    dueDate: "Oct 22", 
    priority: "medium",
    description: "Review and approve pending expenses" 
  }
];

export const INITIAL_STATE: WorkspaceState = {
  currentUser: MOCK_USERS[0],
  users: MOCK_USERS,
  channels: MOCK_CHANNELS,
  dms: MOCK_DMS,
  messages: MOCK_MESSAGES,
  tasks: MOCK_TASKS,
  activeView: "channel",
  activeChannelId: "c1",
};
