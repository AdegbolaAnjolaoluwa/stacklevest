"use client";

import {
    Search,
    Hash,
    Paperclip,
    Send,
    User as UserIcon,
    FileImage,
    CheckSquare,
    Plus as PlusIcon,
    ChevronRight,
    ChevronDown,
    LayoutGrid,
    List,
    MoreHorizontal,
    Calendar,
    Check,
    AlertCircle,
    X,
    Users,
    Trash2,
    Copy,
    Info,
    Bold,
    Italic,
    Link as LinkIcon,
    List as ListIcon,
    Smile,
    CheckCircle2,
    SquarePen,
    Video,
    Phone,
    MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { useWorkspace } from "@/features/workspace/context";
import { useState, useRef, useEffect, FormEvent } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from "@hello-pangea/dnd";
import { Task, User, Attachment } from "@/types";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";

import { filterTasks } from "@/lib/tasks";

export default function WorkspacePage() {
    const {
        activeView,
        activeChannelId,
        activeDmId,
        channels,
        dms,
        messages,
        currentUser,
        sendMessage,
        tasks,
        users,
        updateTaskStatus,
        deleteTask,
        updateTask,
        deleteMessage,
        typingUsers,
        startTyping,
        stopTyping,
        toggleReaction,
        selectedTaskId,
        setSelectedTaskId,
        highlightedMessageId,
        showNotification,
        addTaskComment,
    } = useWorkspace();

    const [inputValue, setInputValue] = useState("");
    const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null);
    const [viewingThreadId, setViewingThreadId] = useState<string | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);

        // Emit start typing
        startTyping();

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 2000);
    };

    const scrollRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [createTaskStatus, setCreateTaskStatus] = useState<"todo" | "in_progress" | "done">("todo");
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskSearchQuery, setTaskSearchQuery] = useState("");
    const [filterAssignedToMe, setFilterAssignedToMe] = useState(false);
    const [filterPriority, setFilterPriority] = useState<string[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);
    const [isSharedTasksOpen, setIsSharedTasksOpen] = useState(true);
    const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isChannelTasksOpen, setIsChannelTasksOpen] = useState(true);
    const [messageAttachments, setMessageAttachments] = useState<Attachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

    const handleTaskClick = (task: Task) => {
        setSelectedTaskId(task.id);
        setIsTaskDetailOpen(true);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (selectedTaskId) {
            const task = tasks.find(t => t.id === selectedTaskId);
            if (task) {
                setIsTaskDetailOpen(true);
            }
        }
    }, [selectedTaskId, tasks]);

    // Handle mobile responsiveness for sidebars
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1280) {
                setIsChannelTasksOpen(false);
                setIsSharedTasksOpen(false);
            } else {
                setIsChannelTasksOpen(true);
                setIsSharedTasksOpen(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (highlightedMessageId) {
            const element = document.getElementById(`message-${highlightedMessageId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('bg-blue-50', 'ring-2', 'ring-blue-200');
                setTimeout(() => {
                    element.classList.remove('bg-blue-50', 'ring-2', 'ring-blue-200');
                }, 2000);
            }
        }
    }, [highlightedMessageId]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current && !highlightedMessageId) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, activeView, activeChannelId, activeDmId, highlightedMessageId]);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const { draggableId, destination } = result;
        const newStatus = destination.droppableId;

        // Only update if status changed
        const task = tasks.find(t => t.id === draggableId);
        if (task && task.status !== newStatus) {
            updateTaskStatus(draggableId, newStatus as "todo" | "in_progress" | "done");
        }
    };

    // Derived state
    const activeChannel = channels.find(c => c.id === activeChannelId);
    const activeDm = dms.find(d => d.id === activeDmId);

    const currentMessages = messages.filter(m => {
        if (activeView === "channel") return m.channelId === activeChannelId && !m.parentId;
        if (activeView === "dm") return m.dmId === activeDmId && !m.parentId;
        return false;
    });

    const threadMessages = messages.filter(m => m.parentId === viewingThreadId);
    const parentMessage = messages.find(m => m.id === viewingThreadId);

    const handleFileUpload = async (files: File[]) => {
        setIsUploading(true);
        try {
            // Simulation of file upload
            const newAttachments: Attachment[] = files.map(file => ({
                id: Math.random().toString(36).substring(7),
                name: file.name,
                type: file.type.includes('image') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'doc',
                url: URL.createObjectURL(file),
                size: `${(file.size / 1024).toFixed(1)} KB`
            }));

            setMessageAttachments(prev => [...prev, ...newAttachments]);
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const removeAttachment = (id: string) => {
        setMessageAttachments(prev => prev.filter(a => a.id !== id));
    };

    const handleSendMessage = (e?: FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() && messageAttachments.length === 0) return;

        // In a real app, sendMessage would accept an object with attachments
        // For now we'll assume the context supports it or we'll update it
        sendMessage(inputValue, messageAttachments, replyToMessageId || undefined);

        setInputValue("");
        setMessageAttachments([]);
        setReplyToMessageId(null);
    };

    const insertFormatting = (prefix: string, suffix: string = prefix) => {
        const textarea = document.querySelector('textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = inputValue;
        const selectedText = text.substring(start, end);
        const before = text.substring(0, start);
        const after = text.substring(end);

        let newText;
        let cursorOffset = 0;

        if (prefix === "- ") {
            // Handle list item specifically
            const needsNewline = before.length > 0 && !before.endsWith('\n');
            newText = `${before}${needsNewline ? '\n' : ''}${prefix}${selectedText}${suffix}${after}`;
            cursorOffset = (needsNewline ? 1 : 0) + prefix.length;
        } else {
            newText = `${before}${prefix}${selectedText}${suffix}${after}`;
            cursorOffset = prefix.length;
        }

        setInputValue(newText);

        // Focus back and set cursor position
        setTimeout(() => {
            textarea.focus();
            const newPos = start + cursorOffset;
            textarea.setSelectionRange(newPos, newPos + selectedText.length);
        }, 0);
    };

    const openCreateTask = (status: "todo" | "in_progress" | "done" = "todo") => {
        setCreateTaskStatus(status);
        setEditingTask(null);
        setIsCreateTaskOpen(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredTasks = filterTasks(tasks, {
        searchQuery: taskSearchQuery,
        assigneeId: filterAssignedToMe ? currentUser.id : undefined,
        priority: filterPriority.length > 0 ? filterPriority : undefined
    }, users).filter(task => {
        if (task.status === 'done' && task.completedAt) {
            const completedTime = new Date(task.completedAt).getTime();
            const now = new Date().getTime();
            const twoHoursInMs = 2 * 60 * 60 * 1000;
            return (now - completedTime) < twoHoursInMs;
        }
        return true;
    });

    const handleStatusChange = (taskId: string, newStatus: "todo" | "in_progress" | "done") => {
        updateTaskStatus(taskId, newStatus);
    };

    // Render Header based on active view
    const renderHeader = () => {
        if (activeView === "tasks") {
            return (
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-slate-500" />
                    <h2 className="font-bold text-slate-900">Task Hub</h2>
                </div>
            );
        }

        if (activeView === "dm" && activeDm) {
            return (
                <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={activeDm.user.avatar} />
                        <AvatarFallback>{activeDm.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <h2 className="font-bold text-slate-900 font-fredoka">{activeDm.user.name}</h2>
                    <div className={cn("w-2 h-2 rounded-full", activeDm.user.status === "online" ? "bg-green-500" : "bg-slate-300")} />
                </div>
            );
        }

        if (activeView === "channel" && activeChannel) {
            return (
                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                    <Hash className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    <h2 className="font-bold text-slate-900 font-fredoka truncate">{activeChannel.name}</h2>
                    <span className="hidden sm:block text-sm text-slate-400 border-l border-slate-200 pl-2 ml-2 truncate">
                        {activeChannel.description}
                    </span>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-white text-slate-900">

            {/* Main Content Area */}
            {activeView === "tasks" ? (
                <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 h-[calc(100vh-64px)]">
                    {/* Tasks Header */}
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-slate-900/50 backdrop-blur-md flex-shrink-0">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                                <span>Workspace</span>
                                <ChevronRight className="w-3 h-3" />
                                <span>Work</span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 font-fredoka">Task Hub</h1>
                        </div>
                        <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => openCreateTask("todo")}>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Create Task
                        </Button>
                    </div>

                    {/* Toolbar */}
                    <div className="px-6 py-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-slate-900/30 backdrop-blur-md flex-shrink-0">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search tasks by title, tag, or assignee..."
                                    className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                                    value={taskSearchQuery}
                                    onChange={(e) => setTaskSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className={cn("h-9 font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50", filterAssignedToMe && "bg-blue-50 border-blue-200 text-blue-700")}>
                                        My Tasks <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setFilterAssignedToMe(false)}>
                                        <span className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", !filterAssignedToMe ? "bg-slate-900 text-white border-slate-900" : "opacity-50 border-slate-300")}>
                                            {!filterAssignedToMe && <Check className="h-3 w-3" />}
                                        </span>
                                        All Tasks
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterAssignedToMe(true)}>
                                        <span className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", filterAssignedToMe ? "bg-slate-900 text-white border-slate-900" : "opacity-50 border-slate-300")}>
                                            {filterAssignedToMe && <Check className="h-3 w-3" />}
                                        </span>
                                        Assigned to Me
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className={cn("h-9 font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50", filterPriority.length > 0 && "bg-blue-50 border-blue-200 text-blue-700")}>
                                        Priority <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {(["high", "medium", "low"] as const).map((p) => {
                                        const isSelected = filterPriority.includes(p);
                                        return (
                                            <DropdownMenuItem
                                                key={p}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setFilterPriority(prev =>
                                                        isSelected ? prev.filter(x => x !== p) : [...prev, p]
                                                    );
                                                }}
                                            >
                                                <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-slate-900 text-white border-slate-900" : "opacity-50 border-slate-300")}>
                                                    {isSelected && <Check className="h-3 w-3" />}
                                                </div>
                                                <span className="capitalize">{p}</span>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                    {filterPriority.length > 0 && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setFilterPriority([])} className="justify-center text-xs text-slate-500">
                                                Clear Filters
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="h-6 w-px bg-slate-200 mx-1" />
                            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 hover:text-blue-700"><LayoutGrid className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600"><List className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </div>

                    {/* Kanban Board */}
                    <div className="flex-1 p-6 overflow-x-auto overflow-y-hidden">
                        {isMounted ? (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <div className="flex gap-6 h-full md:flex-row flex-col md:min-w-[1000px]">
                                    {/* TO DO Column */}
                                    <Droppable droppableId="todo">
                                        {(provided: DroppableProvided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="flex-1 flex flex-col md:min-w-[300px] min-w-full"
                                            >
                                                <div className="flex items-center justify-between mb-4 px-2 py-2 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100/50 dark:border-slate-800/50 backdrop-blur-sm shadow-sm transition-all group-hover/todo:bg-slate-50 dark:group-hover/todo:bg-slate-800">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 shadow-sm shadow-slate-200 dark:shadow-slate-950" />
                                                        <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mt-0.5">To Do</h3>
                                                        <span className="bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">{filteredTasks.filter(t => t.status === 'todo').length}</span>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors rounded-lg" onClick={() => openCreateTask("todo")}>
                                                        <PlusIcon className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                                    {filteredTasks.filter(t => t.status === 'todo').map((task, index) => (
                                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                                            {(provided: DraggableProvided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <TaskCard
                                                                        task={task}
                                                                        users={users}
                                                                        currentUser={currentUser}
                                                                        onClick={() => handleTaskClick(task)}
                                                                        onEdit={(task) => {
                                                                            setEditingTask(task);
                                                                            setIsCreateTaskOpen(true);
                                                                        }}
                                                                        onDelete={(taskId) => {
                                                                            setTaskToDeleteId(taskId);
                                                                            setIsDeleteDialogOpen(true);
                                                                        }}
                                                                        onStatusChange={(task, status) => handleStatusChange(task.id, status)}
                                                                        onProgressChange={(task, progress) => {
                                                                            const updates: Partial<Task> = { progress };
                                                                            if (progress === 100) {
                                                                                updates.status = 'done';
                                                                            } else if (task.status === 'done' && progress < 100) {
                                                                                updates.status = 'in_progress';
                                                                            }
                                                                            updateTask({ ...task, ...updates });
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            </div>
                                        )}
                                    </Droppable>

                                    {/* IN PROGRESS Column */}
                                    <Droppable droppableId="in_progress">
                                        {(provided: DroppableProvided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="flex-1 flex flex-col md:min-w-[300px] min-w-full"
                                            >
                                                <div className="flex items-center justify-between mb-4 px-2 py-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-100/50 dark:border-blue-900/30 backdrop-blur-sm shadow-sm transition-all group-hover/in_progress:bg-blue-50 dark:group-hover/in_progress:bg-blue-900/40">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-200 dark:shadow-blue-900 animate-pulse" />
                                                        <h3 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none mt-0.5">In Progress</h3>
                                                        <span className="bg-white dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/30 shadow-sm">{filteredTasks.filter(t => t.status === 'in_progress').length}</span>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-400 hover:text-blue-600 hover:bg-blue-100/50 dark:hover:bg-blue-900/50 transition-colors rounded-lg" onClick={() => openCreateTask("in_progress")}>
                                                        <PlusIcon className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                                    {filteredTasks.filter(t => t.status === 'in_progress').map((task, index) => (
                                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                                            {(provided: DraggableProvided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <TaskCard
                                                                        task={task}
                                                                        users={users}
                                                                        currentUser={currentUser}
                                                                        onClick={() => handleTaskClick(task)}
                                                                        onEdit={(task) => {
                                                                            setEditingTask(task);
                                                                            setIsCreateTaskOpen(true);
                                                                        }}
                                                                        onDelete={(taskId) => {
                                                                            setTaskToDeleteId(taskId);
                                                                            setIsDeleteDialogOpen(true);
                                                                        }}
                                                                        onStatusChange={(task, status) => handleStatusChange(task.id, status)}
                                                                        onProgressChange={(task, progress) => {
                                                                            const updates: Partial<Task> = { progress };
                                                                            if (progress === 100) {
                                                                                updates.status = 'done';
                                                                            } else if (task.status === 'done' && progress < 100) {
                                                                                updates.status = 'in_progress';
                                                                            }
                                                                            updateTask({ ...task, ...updates });
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            </div>
                                        )}
                                    </Droppable>

                                    {/* DONE Column */}
                                    <Droppable droppableId="done">
                                        {(provided: DroppableProvided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="flex-1 flex flex-col md:min-w-[300px] min-w-full"
                                            >
                                                <div className="flex items-center justify-between mb-4 px-2 py-2 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30 backdrop-blur-sm shadow-sm transition-all group-hover/done:bg-emerald-50 dark:group-hover/done:bg-emerald-900/40">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200 dark:shadow-emerald-900" />
                                                        <h3 className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mt-0.5">Done</h3>
                                                        <span className="bg-white dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 shadow-sm">{filteredTasks.filter(t => t.status === 'done').length}</span>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/50 transition-colors rounded-lg">
                                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                                    {filteredTasks.filter(t => t.status === 'done').map((task, index) => (
                                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                                            {(provided: DraggableProvided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <TaskCard
                                                                        task={task}
                                                                        users={users}
                                                                        currentUser={currentUser}
                                                                        onClick={() => handleTaskClick(task)}
                                                                        onEdit={(task) => {
                                                                            setEditingTask(task);
                                                                            setIsCreateTaskOpen(true);
                                                                        }}
                                                                        onDelete={(taskId) => {
                                                                            setTaskToDeleteId(taskId);
                                                                            setIsDeleteDialogOpen(true);
                                                                        }}
                                                                        onStatusChange={(task, status) => handleStatusChange(task.id, status)}
                                                                        onProgressChange={(task, progress) => {
                                                                            const updates: Partial<Task> = { progress };
                                                                            if (progress === 100) {
                                                                                updates.status = 'done';
                                                                            } else if (task.status === 'done' && progress < 100) {
                                                                                updates.status = 'in_progress';
                                                                            }
                                                                            updateTask({ ...task, ...updates });
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            </DragDropContext>
                        ) : (
                            <div className="flex gap-6 h-full min-w-[1000px]">
                                {/* Loading or static skeleton could go here */}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-row min-w-0 bg-white dark:bg-slate-950 h-[calc(100vh-64px)]">
                    <div className="flex-1 flex flex-col min-w-0 relative group/dropzone">
                        {/* Drop zone overlay */}
                        <div
                            className="absolute inset-0 z-50 pointer-events-none transition-all duration-200"
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                                e.currentTarget.style.border = '2px dashed #3b82f6';
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.border = 'none';
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.border = 'none';
                                const files = Array.from(e.dataTransfer.files);
                                if (files.length > 0) handleFileUpload(files);
                            }}
                        >
                        </div>
                        {/* Channel/DM Header */}
                        <div className="h-16 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-6 bg-white/80 dark:bg-background/80 flex-shrink-0 backdrop-blur-xl sticky top-0 z-10 transition-colors">
                            <div className="flex items-center gap-3">
                                {activeView === "dm" && activeDm ? (
                                    <>
                                        <div className="relative">
                                            <Avatar className="w-10 h-10 border-2 border-white dark:border-slate-900 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                                                <AvatarImage src={activeDm.user.avatar} className="object-cover" />
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                                                    {activeDm.user.name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={cn(
                                                "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-white dark:border-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm",
                                                activeDm.user.status === "online" ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                                            )} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg font-fredoka leading-none">{activeDm.user.name}</h2>
                                                <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-wider border border-blue-100 shadow-sm">PRO</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-medium">Product Designer • Active Now</p>
                                        </div>
                                    </>
                                ) : (
                                    renderHeader()
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {activeView === "dm" ? (
                                    <>
                                        <div className="hidden sm:flex items-center gap-1 mr-2 px-2 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/50 dark:border-slate-700/50 shadow-sm">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                onClick={() => showNotification({ title: "Feature Pending", message: "Video call feature coming soon!", type: "info" })}
                                                title="Video Call"
                                            >
                                                <Video className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                onClick={() => showNotification({ title: "Feature Pending", message: "Audio call feature coming soon!", type: "info" })}
                                                title="Voice Call"
                                            >
                                                <Phone className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                onClick={() => showNotification({ title: "Details Pending", message: "Conversation details coming soon!", type: "info" })}
                                                title="View Details"
                                            >
                                                <Info className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {/* Mobile Header Menu */}
                                        <div className="sm:hidden mr-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 rounded-xl hover:bg-slate-50">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => showNotification({ title: "Feature Pending", message: "Video call feature coming soon!", type: "info" })}>
                                                        <Video className="w-4 h-4 mr-2" /> Video Call
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => showNotification({ title: "Feature Pending", message: "Audio call feature coming soon!", type: "info" })}>
                                                        <Phone className="w-4 h-4 mr-2" /> Voice Call
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => showNotification({ title: "Details Pending", message: "Conversation details coming soon!", type: "info" })}>
                                                        <Info className="w-4 h-4 mr-2" /> View Details
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsSharedTasksOpen(!isSharedTasksOpen)}
                                            className={cn("text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 h-9 w-9 rounded-xl transition-all", isSharedTasksOpen && "bg-slate-100/80 dark:bg-slate-800/80 text-blue-600 ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm")}
                                            title={isSharedTasksOpen ? "Hide Shared Tasks" : "Show Shared Tasks"}
                                        >
                                            <LayoutGrid className="w-5 h-5 transition-transform group-hover:scale-110" />
                                        </Button>
                                    </>
                                ) : activeView === "channel" ? (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="hidden sm:flex -space-x-2 mr-2">
                                                {users.slice(0, 3).map(u => (
                                                    <Avatar key={u.id} className="w-6 h-6 border-2 border-white">
                                                        <AvatarImage src={u.avatar} />
                                                        <AvatarFallback>{u.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                {users.length > 3 && (
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                        +{users.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/50 dark:border-slate-700/50 shadow-sm">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    onClick={() => showNotification({ title: "Feature Pending", message: "Channel video feature coming soon!", type: "info" })}
                                                    title="Channel Video"
                                                >
                                                    <Video className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    onClick={() => showNotification({ title: "Details Pending", message: "Channel info coming soon!", type: "info" })}
                                                    title="Channel Details"
                                                >
                                                    <Info className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="hidden md:block w-px h-6 bg-slate-200" />
                                            {/* Mobile Channel Menu */}
                                            <div className="md:hidden mr-1">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 rounded-xl hover:bg-slate-50">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => showNotification({ title: "Feature Pending", message: "Channel video feature coming soon!", type: "info" })}>
                                                            <Video className="w-4 h-4 mr-2" /> Channel Video
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => showNotification({ title: "Details Pending", message: "Channel info coming soon!", type: "info" })}>
                                                            <Info className="w-4 h-4 mr-2" /> Channel Details
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setIsChannelTasksOpen(!isChannelTasksOpen)}
                                                className={cn("text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 h-9 w-9 rounded-xl transition-all", isChannelTasksOpen && "bg-slate-100/80 dark:bg-slate-800/80 text-blue-600 ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm")}
                                                title={isChannelTasksOpen ? "Hide Channel Tasks" : "Show Channel Tasks"}
                                            >
                                                <LayoutGrid className="w-5 h-5 transition-transform group-hover:scale-110" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <div className="flex -space-x-2">
                                            {users.slice(0, 3).map(u => (
                                                <Avatar key={u.id} className="w-6 h-6 border-2 border-white">
                                                    <AvatarImage src={u.avatar} />
                                                    <AvatarFallback>{u.name[0]}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {users.length > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-medium">
                                                    +{users.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium ml-2">{users.length} staff members</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-6 bg-slate-50/30 dark:bg-background/95 transition-colors">
                            <div className="max-w-3xl mx-auto space-y-6">
                                {/* Welcome Message */}
                                <div className="text-center py-12 px-6">
                                    <div className="w-20 h-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400 rotate-3 transform transition-transform group-hover:rotate-0">
                                        {activeView === "channel" ? <Hash className="w-10 h-10 text-indigo-500/50" /> : <UserIcon className="w-10 h-10 text-blue-500/50" />}
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-900 font-fredoka max-w-sm mx-auto leading-tight">
                                        This is the beginning of your conversation in {activeView === "channel" ? `#${activeChannel?.name}` : activeDm?.user.name}.
                                    </h3>
                                    <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">Messages sent here are secure and encrypted.</p>
                                </div>

                                {currentMessages.map((msg, i) => {
                                    const isMe = msg.senderId === currentUser.id;
                                    const sender = users.find(u => u.id === msg.senderId);
                                    const prevMsg = currentMessages[i - 1];

                                    // Date Separator Logic
                                    const date = new Date(msg.timestamp);
                                    const prevDate = prevMsg ? new Date(prevMsg.timestamp) : null;
                                    const showDateSeparator = !prevDate || date.toDateString() !== prevDate.toDateString();

                                    let dateLabel = format(date, "MMMM d, yyyy");
                                    if (date.toDateString() === new Date().toDateString()) dateLabel = "Today";
                                    const yesterday = new Date();
                                    yesterday.setDate(yesterday.getDate() - 1);
                                    if (date.toDateString() === yesterday.toDateString()) dateLabel = "Yesterday";

                                    const showHeader = i === 0 || !prevMsg || prevMsg.senderId !== msg.senderId ||
                                        (date.getTime() - new Date(prevMsg.timestamp).getTime() > 300000);

                                    return (
                                        <div key={msg.id} id={`message-${msg.id}`}>
                                            {showDateSeparator && (
                                                <div className="flex items-center justify-center my-6">
                                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                        {dateLabel}
                                                    </span>
                                                </div>
                                            )}

                                            <div className={cn("flex gap-3 group", isMe ? "flex-row-reverse" : "flex-row", !showHeader && "mt-1")}>
                                                <div className="w-9 flex-shrink-0 flex flex-col items-center">
                                                    {showHeader && !isMe && (
                                                        <Avatar className="w-9 h-9 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                            <AvatarImage src={sender?.avatar} className="object-cover" />
                                                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                                                {sender?.name[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    {showHeader && isMe && (
                                                        <Avatar className="w-9 h-9 border-2 border-white shadow-sm ring-1 ring-slate-50">
                                                            <AvatarImage src={currentUser.avatar} className="object-cover" />
                                                            <AvatarFallback className="bg-blue-600 text-white font-bold">
                                                                {currentUser.name[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                </div>

                                                <div className={cn("max-w-[70%] flex flex-col", isMe ? "items-end" : "items-start")}>
                                                    {showHeader && !isMe && (
                                                        <div className="flex items-baseline gap-2 mb-1 px-1">
                                                            <span className="font-bold text-sm text-slate-900">{sender?.name}</span>
                                                            <span className="text-[10px] text-slate-400">{format(date, "h:mm a")}</span>
                                                        </div>
                                                    )}

                                                    <div className={cn(
                                                        "px-4 py-3 shadow-sm text-sm leading-relaxed relative group-hover:shadow-md transition-all duration-300 border",
                                                        isMe
                                                            ? "bg-blue-600 dark:bg-blue-600/90 border-blue-500/50 dark:border-blue-400/30 text-white rounded-2xl rounded-tr-none shadow-blue-500/10 dark:shadow-blue-500/5"
                                                            : "bg-white dark:bg-card border-slate-100 dark:border-white/5 text-slate-900 dark:text-slate-100 rounded-2xl rounded-tl-none"
                                                    )}>
                                                        {msg.content}

                                                        {msg.attachments && msg.attachments.length > 0 && (
                                                            <div className="mt-2 space-y-2">
                                                                {msg.attachments.map((file) => (
                                                                    <a
                                                                        key={file.id}
                                                                        href={file.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={cn(
                                                                            "flex items-center gap-2 p-2 rounded-lg border text-xs transition-colors",
                                                                            isMe
                                                                                ? "bg-blue-500/30 border-blue-400/50 hover:bg-blue-500/50"
                                                                                : "bg-white/50 border-slate-200 hover:bg-white"
                                                                        )}
                                                                    >
                                                                        {file.type === 'image' ? (
                                                                            <FileImage className="w-4 h-4" />
                                                                        ) : (
                                                                            <Paperclip className="w-4 h-4" />
                                                                        )}
                                                                        <div className="flex flex-col overflow-hidden">
                                                                            <span className="font-medium truncate max-w-[150px]">{file.name}</span>
                                                                            <span className="text-[10px] opacity-70 uppercase">{file.size}</span>
                                                                        </div>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Quick Reaction Button (on hover) */}
                                                        <div className={cn(
                                                            "absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 rounded-2xl p-1.5 z-10 scale-95 group-hover:scale-100",
                                                            isMe ? "right-0 origin-right" : "left-0 origin-left"
                                                        )}>
                                                            {["👍", "❤️", "😂", "😮", "😢", "🔥"].map(emoji => (
                                                                <button
                                                                    key={emoji}
                                                                    onClick={() => toggleReaction(msg.id, emoji)}
                                                                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl text-lg transition-all hover:scale-110 active:scale-90"
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                            <button
                                                                onClick={() => {
                                                                    setReplyToMessageId(msg.id);
                                                                    setViewingThreadId(msg.id);
                                                                }}
                                                                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all hover:scale-110 active:scale-90"
                                                                title="Reply in thread"
                                                            >
                                                                <MessageSquare className="w-4 h-4" />
                                                            </button>
                                                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1.5" />
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(msg.content);
                                                                    showNotification({
                                                                        title: "Copied",
                                                                        message: "Message text copied to clipboard",
                                                                        type: "success"
                                                                    });
                                                                }}
                                                                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl transition-colors"
                                                                title="Copy text"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingTask({
                                                                        id: "new",
                                                                        title: msg.content.slice(0, 100),
                                                                        status: "todo",
                                                                        priority: "medium",
                                                                        assigneeIds: [currentUser.id],
                                                                        creatorId: currentUser.id,
                                                                        createdAt: new Date().toISOString(),
                                                                        dueDate: "Due Today",
                                                                        channelId: activeChannelId || undefined,
                                                                        dmId: activeDmId || undefined,
                                                                        description: `Converted from message: "${msg.content}"`
                                                                    } as any);
                                                                    setIsCreateTaskOpen(true);
                                                                }}
                                                                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors"
                                                                title="Convert to Task"
                                                            >
                                                                <CheckSquare className="w-4 h-4" />
                                                            </button>
                                                            {(isMe || currentUser.role?.toLowerCase() === 'admin') && (
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm("Are you sure you want to delete this message?")) {
                                                                            deleteMessage(msg.id);
                                                                        }
                                                                    }}
                                                                    className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                                                                    title="Delete message"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Display Reactions */}
                                                    {msg.reactions && msg.reactions.length > 0 && (
                                                        <div className={cn("flex flex-wrap gap-1 mt-1.5", isMe ? "justify-end" : "justify-start")}>
                                                            {msg.reactions.map((reaction) => {
                                                                const hasReacted = reaction.userIds.includes(currentUser.id);
                                                                return (
                                                                    <button
                                                                        key={reaction.emoji}
                                                                        onClick={() => toggleReaction(msg.id, reaction.emoji)}
                                                                        className={cn(
                                                                            "flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-xs transition-colors",
                                                                            hasReacted
                                                                                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                                                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                                        )}
                                                                    >
                                                                        <span>{reaction.emoji}</span>
                                                                        <span className="font-semibold">{reaction.userIds.length}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {isMe && showHeader && (
                                                        <span className="text-[10px] text-slate-300 mt-1 px-1">{format(date, "h:mm a")}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-4 bg-white/80 dark:bg-background/80 border-t border-slate-100 dark:border-white/5 backdrop-blur-xl">
                            <div className="max-w-3xl mx-auto">
                                <div className="border border-slate-200 dark:border-white/10 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all bg-white dark:bg-secondary/40 backdrop-blur-sm overflow-hidden">
                                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                                        <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-secondary/20 rounded-t-xl group/toolbar">
                                            <div className="hidden md:flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    type="button"
                                                    className="w-8 h-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-all"
                                                    onClick={() => insertFormatting("**")}
                                                    title="Bold"
                                                >
                                                    <Bold className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    type="button"
                                                    className="w-8 h-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-all"
                                                    onClick={() => insertFormatting("_")}
                                                    title="Italic"
                                                >
                                                    <Italic className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    type="button"
                                                    className="w-8 h-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-all"
                                                    onClick={() => insertFormatting("[text](url)")}
                                                    title="Link"
                                                >
                                                    <LinkIcon className="w-4 h-4" />
                                                </Button>
                                                <div className="w-px h-4 bg-slate-200/60 dark:bg-white/10 mx-1" />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    type="button"
                                                    className="w-8 h-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-all"
                                                    onClick={() => insertFormatting("- ")}
                                                    title="Bullet List"
                                                >
                                                    <ListIcon className="w-4 h-4" />
                                                </Button>
                                                <div className="w-px h-4 bg-slate-200/60 dark:bg-white/10 mx-1" />
                                            </div>
                                            <div className="relative">
                                                <Button variant="ghost" size="icon" type="button" className="w-8 h-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-all" title="Attach Files">
                                                    <Paperclip className="w-4 h-4" />
                                                    <input
                                                        type="file"
                                                        multiple
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={(e) => {
                                                            const files = e.target.files ? Array.from(e.target.files) : [];
                                                            handleFileUpload(files);
                                                        }}
                                                    />
                                                </Button>
                                            </div>
                                            <DropdownMenu open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        type="button"
                                                        className="w-8 h-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-all"
                                                        title="Emoji"
                                                    >
                                                        <Smile className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="p-2 grid grid-cols-6 gap-1 w-[240px] shadow-2xl border-slate-200/60 dark:border-white/10 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90">
                                                    {["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩"].map((emoji) => (
                                                        <button
                                                            key={emoji}
                                                            type="button"
                                                            className="h-8 w-8 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-lg transition-transform hover:scale-125"
                                                            onClick={() => {
                                                                setInputValue(prev => prev + emoji);
                                                                setShowEmojiPicker(false);
                                                            }}
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            {/* Reply Indicator */}
                                            {replyToMessageId && (
                                                <div className="flex items-center justify-between px-3 py-2 bg-blue-50/50 dark:bg-blue-500/10 border-b border-blue-100 dark:border-blue-500/20">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
                                                            Replying to {messages.find(m => m.id === replyToMessageId)?.user?.name || 'message'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => setReplyToMessageId(null)}
                                                        className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded text-blue-400 transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                            {/* Typing Indicator */}
                                            {(typingUsers?.[activeChannelId || activeDmId || ""] || []).length > 0 && (
                                                <div className="ml-auto flex items-center gap-2 px-3 animate-in fade-in slide-in-from-right-2">
                                                    <div className="flex space-x-1">
                                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                        <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></div>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                                                        {(typingUsers?.[activeChannelId || activeDmId || ""] || [])
                                                            .map(id => users.find(u => u.id === id)?.name?.split(' ')[0])
                                                            .filter(Boolean)
                                                            .join(", ") + " is typing"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            {messageAttachments.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {messageAttachments.map((file) => (
                                                        <div key={file.id} className="relative group">
                                                            <div className="flex items-center gap-2 p-1.5 pr-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs">
                                                                {file.type === 'image' ? (
                                                                    <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                                                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                                                        <Paperclip className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-col max-w-[120px]">
                                                                    <span className="font-medium truncate text-slate-900 dark:text-slate-100">{file.name}</span>
                                                                    <span className="text-[10px] text-slate-400 uppercase">{file.size}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeAttachment(file.id)}
                                                                    className="ml-1 p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <textarea
                                                value={inputValue}
                                                onChange={handleInputChange}
                                                onKeyDown={handleKeyDown}
                                                placeholder={`Message ${activeView === 'channel' ? '#' + activeChannel?.name : activeDm?.user.name}...`}
                                                className="w-full resize-none border-0 focus:ring-0 p-0 min-h-[40px] max-h-[300px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 bg-transparent text-sm"
                                                rows={1}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-2 pt-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                type="button"
                                                className="w-8 h-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                                                onClick={() => openCreateTask("todo")}
                                                title="Create Task"
                                            >
                                                <PlusIcon className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                type="submit"
                                                size="icon"
                                                disabled={!inputValue.trim()}
                                                className={cn("h-8 w-8 rounded-lg transition-all", inputValue.trim() ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20" : "bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-600")}
                                            >
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Shared Tasks (DM Only) */}
                    {activeView === "dm" && activeDm && isSharedTasksOpen && (
                        <div className="w-[320px] bg-white dark:bg-card border-l border-slate-200 dark:border-white/5 flex flex-col h-full animate-in slide-in-from-right duration-300">
                            <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold font-fredoka">
                                    <CheckSquare className="w-5 h-5 text-blue-600" />
                                    <h3>Shared Tasks</h3>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="dark:border-white/10">
                                        <DropdownMenuLabel>Shared Task Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => openCreateTask("todo")}>
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Create New Task
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="p-4 space-y-6">
                                    {/* Assigned to Me */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned to Me</h4>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40"
                                                onClick={() => openCreateTask("todo")}
                                            >
                                                <PlusIcon className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {tasks
                                                .filter(t => t.assigneeIds.includes(currentUser.id) && (t.channelId === activeChannelId || t.dmId === activeDmId))
                                                .slice(0, 10)
                                                .map(task => (
                                                    <div
                                                        key={task.id}
                                                        className="p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-lg hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors cursor-pointer group"
                                                        onClick={() => {
                                                            setSelectedTaskId(task.id);
                                                            setIsTaskDetailOpen(true);
                                                        }}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div
                                                                className={cn(
                                                                    "w-4 h-4 mt-0.5 rounded border border-slate-300 dark:border-slate-700 hover:border-blue-500 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0",
                                                                    task.status === 'done' && "bg-blue-500 border-blue-500"
                                                                )}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done');
                                                                }}
                                                            >
                                                                {task.status === 'done' && <Check className="w-2.5 h-2.5 text-white" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className={cn("text-sm font-medium text-slate-900 dark:text-slate-100 truncate", task.status === 'done' && "line-through text-slate-400 dark:text-slate-500")}>{task.title}</h5>
                                                                <div className="flex items-center gap-2 mt-1.5">
                                                                    <span className={cn(
                                                                        "text-[10px] px-1.5 py-0.5 rounded font-medium",
                                                                        task.priority === "high" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                                                                            task.priority === "medium" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" :
                                                                                "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                                    )}>
                                                                        {task.priority}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            {tasks.filter(t => t.assigneeIds.includes(currentUser.id) && (t.channelId === activeChannelId || t.dmId === activeDmId)).length === 0 && (
                                                <p className="text-xs text-slate-400 text-center py-2">No tasks assigned to you</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Assigned to Partner */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned to {activeDm.user.name.split(' ')[0]}</h4>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40"
                                                onClick={() => openCreateTask("todo")}
                                            >
                                                <PlusIcon className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {tasks
                                                .filter(t => t.assigneeIds.includes(activeDm.user.id))
                                                .slice(0, 10)
                                                .map(task => (
                                                    <div
                                                        key={task.id}
                                                        className="p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-lg hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors cursor-pointer group"
                                                        onClick={() => {
                                                            setSelectedTaskId(task.id);
                                                            setIsTaskDetailOpen(true);
                                                        }}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div
                                                                className={cn(
                                                                    "w-4 h-4 mt-0.5 rounded border border-slate-300 dark:border-slate-700 hover:border-blue-500 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0",
                                                                    task.status === 'done' && "bg-blue-500 border-blue-500"
                                                                )}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done');
                                                                }}
                                                            >
                                                                {task.status === 'done' && <Check className="w-2.5 h-2.5 text-white" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className={cn("text-sm font-medium text-slate-900 dark:text-slate-100 truncate", task.status === 'done' && "line-through text-slate-400 dark:text-slate-500")}>{task.title}</h5>
                                                                <div className="flex items-center gap-2 mt-1.5">
                                                                    <span className={cn(
                                                                        "text-[10px] px-1.5 py-0.5 rounded font-medium",
                                                                        task.priority === "high" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                                                                            task.priority === "medium" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" :
                                                                                "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                                    )}>
                                                                        {task.priority}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            {tasks.filter(t => t.assigneeIds.includes(activeDm.user.id)).length === 0 && (
                                                <div className="text-center py-8">
                                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                                                        <CheckCircle2 className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                                    </div>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">No tasks assigned to {activeDm.user.name.split(' ')[0]}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>

                            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white/50 dark:bg-background/50 backdrop-blur-sm">
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-blue-500/30 hover:bg-slate-50 dark:hover:bg-blue-500/5 shadow-sm transition-all rounded-xl"
                                    onClick={() => openCreateTask("todo")}
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    New Task
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Right Sidebar - Channel Tasks (Channel Only) */}
                    {activeView === "channel" && activeChannel && isChannelTasksOpen && (
                        <div className="w-[320px] bg-white dark:bg-card border-l border-slate-200 dark:border-white/5 flex flex-col h-full animate-in slide-in-from-right duration-300">
                            <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 font-fredoka tracking-subtle flex items-center gap-2">
                                        <CheckSquare className="w-5 h-5 text-blue-600" />
                                        Channel Tasks
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-7">#{activeChannel.name}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600 rounded-lg" onClick={() => setIsChannelTasksOpen(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="p-4 space-y-6">
                                    {/* Active Tasks */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Tasks</h4>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40"
                                                onClick={() => openCreateTask("todo")}
                                            >
                                                <PlusIcon className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        <div className="space-y-3">
                                            {tasks.filter(t => t.channelId === activeChannel.id && t.status !== 'done').map(task => (
                                                <div key={task.id} className="group bg-white dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer hover:-translate-y-0.5" onClick={() => { setSelectedTaskId(task.id); setIsTaskDetailOpen(true); }}>
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className="mt-0.5 w-5 h-5 rounded-md border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-500 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateTaskStatus(task.id, 'done');
                                                            }}
                                                        >
                                                            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate font-fredoka tracking-tight leading-tight">{task.title}</h5>
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <span className={cn(
                                                                    "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md border",
                                                                    task.priority === 'high' ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/40" : task.priority === 'medium' ? "bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400 border-amber-100 dark:border-amber-900/40" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40"
                                                                )}>
                                                                    {task.priority || 'low'}
                                                                </span>
                                                                <div className="flex -space-x-1 ml-auto">
                                                                    {task.assigneeIds.map(id => {
                                                                        const user = users.find(u => u.id === id);
                                                                        return (
                                                                            <Avatar key={id} className="w-4.5 h-4.5 border-2 border-white dark:border-slate-900 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                                                                                <AvatarImage src={user?.avatar} />
                                                                                <AvatarFallback className="text-[6px]">{user?.name[0]}</AvatarFallback>
                                                                            </Avatar>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {tasks.filter(t => t.channelId === activeChannel.id && t.status !== 'done').length === 0 && (
                                                <div className="text-center py-8">
                                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-2 rotate-3 transition-transform hover:rotate-0">
                                                        <CheckCircle2 className="w-5 h-5 text-slate-300" />
                                                    </div>
                                                    <p className="text-[11px] font-medium text-slate-400">All caught up!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recently Completed */}
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Recently Completed</h4>
                                        <div className="space-y-3">
                                            {tasks
                                                .filter(t => t.channelId === activeChannel.id && t.status === 'done' && t.completedAt && (new Date().getTime() - new Date(t.completedAt).getTime() < 2 * 60 * 60 * 1000))
                                                .slice(0, 5)
                                                .map(task => (
                                                    <div
                                                        key={task.id}
                                                        className="p-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100/50 dark:border-white/5 rounded-2xl opacity-60 hover:opacity-100 transition-all cursor-pointer group"
                                                        onClick={() => {
                                                            setSelectedTaskId(task.id);
                                                            setIsTaskDetailOpen(true);
                                                        }}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div
                                                                className="w-5 h-5 mt-0.5 rounded-md bg-blue-600 border border-blue-600 flex items-center justify-center cursor-pointer shadow-sm shadow-blue-200 dark:shadow-blue-900/20"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateTaskStatus(task.id, 'todo');
                                                                }}
                                                            >
                                                                <Check className="w-3 h-3 text-white" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="text-sm font-bold text-slate-400 dark:text-slate-500 truncate line-through font-fredoka">{task.title}</h5>
                                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-1">
                                                                    Completed {new Date(task.completedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            {tasks.filter(t => t.channelId === activeChannel.id && t.status === 'done' && t.completedAt && (new Date().getTime() - new Date(t.completedAt).getTime() < 2 * 60 * 60 * 1000)).length === 0 && (
                                                <p className="text-[11px] text-slate-400 italic font-medium px-1">Done tasks will appear here</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>

                            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white/50 dark:bg-background/50 backdrop-blur-sm">
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-blue-500/30 hover:bg-slate-50 dark:hover:bg-blue-500/5 shadow-sm transition-all rounded-xl h-10 font-bold"
                                    onClick={() => openCreateTask("todo")}
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    New Task
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <TaskDetailModal
                task={selectedTask}
                isOpen={isTaskDetailOpen}
                onClose={() => {
                    setIsTaskDetailOpen(false);
                    setSelectedTaskId(undefined);
                }}
                users={users}
                currentUser={currentUser}
                onUpdateTask={(task) => {
                    updateTask(task);
                    setIsTaskDetailOpen(false);
                    setSelectedTaskId(undefined);
                }}
                onDeleteTask={(id) => {
                    setTaskToDeleteId(id);
                    setIsDeleteDialogOpen(true);
                    setIsTaskDetailOpen(false);
                    setSelectedTaskId(undefined);
                }}
                onAddComment={addTaskComment}
            />
            <CreateTaskDialog
                open={isCreateTaskOpen}
                onOpenChange={setIsCreateTaskOpen}
                initialStatus={createTaskStatus}
                taskToEdit={editingTask}
            />
            <DeleteTaskDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={() => {
                    if (taskToDeleteId) {
                        deleteTask(taskToDeleteId);
                    }
                }}
            />
        </div >
    );
}

// Helper for Plus icon since it wasn't imported in original scope of this file
// function Plus removed as it was unused


function TaskCard({
    task,
    users,
    currentUser,
    onEdit,
    onDelete,
    onStatusChange,
    onProgressChange,
    onClick
}: {
    task: Task,
    users: User[],
    currentUser: User,
    onEdit: (task: Task) => void,
    onDelete: (taskId: string) => void,
    onStatusChange: (task: Task, status: "todo" | "in_progress" | "done") => void,
    onProgressChange: (task: Task, progress: number) => void,
    onClick?: () => void
}) {
    const isCreatorOrAdmin = task.creatorId === currentUser.id || currentUser.role?.toLowerCase() === 'admin';

    return (
        <div
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer group relative hover:-translate-y-0.5"
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-3">
                <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest border shadow-sm",
                    task.priority === "high" ? "bg-red-50 text-red-600 border-red-100" :
                        task.priority === "medium" ? "bg-amber-50 text-amber-600 border-amber-100" :
                            "bg-emerald-50 text-emerald-600 border-emerald-100"
                )}>
                    {task.priority || "Low"}
                </span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity -mr-1.5 -mt-1.5 focus:opacity-100 data-[state=open]:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 shadow-xl border-slate-200/60 backdrop-blur-xl bg-white/90">
                        <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
                            <SquarePen className="w-3.5 h-3.5" />
                            Edit Task
                        </DropdownMenuItem>
                        {task.status !== 'todo' && (
                            <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onStatusChange(task, 'todo'); }}>
                                <div className="w-2 h-2 rounded-full bg-slate-400" />
                                Move to To Do
                            </DropdownMenuItem>
                        )}
                        {task.status !== 'in_progress' && (
                            <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onStatusChange(task, 'in_progress'); }}>
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                Move to In Progress
                            </DropdownMenuItem>
                        )}
                        {task.status !== 'done' && (
                            <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onStatusChange(task, 'done'); }}>
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                Mark as Done
                            </DropdownMenuItem>
                        )}
                        {isCreatorOrAdmin && (
                            <>
                                <DropdownMenuSeparator className="bg-slate-200/60" />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="text-red-600 focus:text-red-600 gap-2">
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Task
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <h4 className={cn("font-bold text-slate-900 dark:text-slate-100 mb-4 text-[14px] leading-tight font-fredoka tracking-subtle", task.status === 'done' && "line-through text-slate-400 dark:text-slate-500")}>
                {task.title}
            </h4>

            {task.status === 'todo' && (
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full mb-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400 font-bold h-9 rounded-xl transition-all shadow-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(task, 'in_progress');
                    }}
                >
                    Start Task
                </Button>
            )}

            {task.status === 'in_progress' && (
                <div className="mb-4">
                    <div className="flex gap-1 h-2 w-full mb-1.5">
                        {[25, 50, 75, 100].map((p) => (
                            <div
                                key={p}
                                className={cn(
                                    "flex-1 rounded-full cursor-pointer transition-all hover:scale-x-105 active:scale-95",
                                    (task.progress || 0) >= p
                                        ? (p === 100 ? "bg-emerald-500 shadow-sm shadow-emerald-200" : "bg-blue-600 shadow-sm shadow-blue-200")
                                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onProgressChange(task, p);
                                }}
                                title={p === 100 ? "Done" : `${p}%`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-widest px-1 mt-1.5">
                        <span className={cn((task.progress || 0) >= 25 && "text-blue-600")}>25%</span>
                        <span className={cn((task.progress || 0) >= 50 && "text-blue-600")}>50%</span>
                        <span className={cn((task.progress || 0) >= 75 && "text-blue-600")}>75%</span>
                        <span className={cn((task.progress || 0) >= 100 && "text-emerald-600")}>Complete</span>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                <div className={cn("flex items-center gap-1.5 text-[11px] font-bold tracking-tight",
                    task.dueDate === "Due Today" ? "text-red-500" : "text-slate-400"
                )}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{task.dueDate}</span>
                </div>

                <div className="flex -space-x-1.5">
                    {task.assigneeIds?.map((id: string) => {
                        const user = users.find(u => u.id === id);
                        if (!user) return null;
                        return (
                            <Avatar key={id} className="w-6 h-6 border-2 border-white dark:border-slate-900 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                                <AvatarImage src={user.avatar} className="object-cover" />
                                <AvatarFallback className="text-[10px] bg-indigo-50 text-indigo-600 font-bold">{user.name[0]}</AvatarFallback>
                            </Avatar>
                        );
                    })}
                    {task.status === 'done' && (
                        <div className="w-6 h-6 rounded-full bg-emerald-50 border-2 border-white ring-1 ring-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                            <CheckSquare className="w-3 h-3" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
