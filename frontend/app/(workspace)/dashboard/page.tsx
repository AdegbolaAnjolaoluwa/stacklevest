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
  CheckCircle2
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
    if (activeView === "channel") return m.channelId === activeChannelId;
    if (activeView === "dm") return m.dmId === activeDmId;
    return false;
  });

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
    sendMessage(inputValue, messageAttachments);
    
    setInputValue("");
    setMessageAttachments([]);
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
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-slate-500" />
          <h2 className="font-bold text-slate-900 font-fredoka">{activeChannel.name}</h2>
          <span className="text-sm text-slate-400 border-l border-slate-200 pl-2 ml-2">
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
         <div className="flex-1 flex flex-col min-w-0 bg-slate-50 h-[calc(100vh-64px)]">
            {/* Tasks Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white flex-shrink-0">
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
            <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-white flex-shrink-0">
                <div className="flex items-center gap-4 flex-1">
                     <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Search tasks by title, tag, or assignee..." 
                            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
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
                                  <div className="flex items-center justify-between mb-4 px-1">
                                      <div className="flex items-center gap-2">
                                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">To Do</h3>
                                          <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{filteredTasks.filter(t => t.status === 'todo').length}</span>
                                      </div>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600" onClick={() => openCreateTask("todo")}>
                                          <PlusIcon className="w-4 h-4" />
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
                                  <div className="flex items-center justify-between mb-4 px-1">
                                      <div className="flex items-center gap-2">
                                          <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider">In Progress</h3>
                                          <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{filteredTasks.filter(t => t.status === 'in_progress').length}</span>
                                      </div>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600" onClick={() => openCreateTask("in_progress")}>
                                          <PlusIcon className="w-4 h-4" />
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
                                  <div className="flex items-center justify-between mb-4 px-1">
                                      <div className="flex items-center gap-2">
                                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Done</h3>
                                          <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{filteredTasks.filter(t => t.status === 'done').length}</span>
                                      </div>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600">
                                          <MoreHorizontal className="w-4 h-4" />
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
        <div className="flex-1 flex flex-row min-w-0 bg-white h-[calc(100vh-64px)]">
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
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white flex-shrink-0">
                <div className="flex items-center gap-3">
                    {activeView === "dm" && activeDm ? (
                        <>
                            <div className="relative">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={activeDm.user.avatar} />
                                    <AvatarFallback>{activeDm.user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white", activeDm.user.status === "online" ? "bg-green-500" : "bg-slate-300")} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="font-bold text-slate-900 text-lg">{activeDm.user.name}</h2>
                                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide">PRO</span>
                                </div>
                                <p className="text-xs text-slate-500">Product Designer • Active Now</p>
                            </div>
                        </>
                    ) : (
                        renderHeader()
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {activeView === "dm" ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSharedTasksOpen(!isSharedTasksOpen)}
                            className={cn("text-slate-400 hover:text-slate-600", isSharedTasksOpen && "bg-slate-100 text-slate-900")}
                            title={isSharedTasksOpen ? "Hide Shared Tasks" : "Show Shared Tasks"}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </Button>
                    ) : activeView === "channel" ? (
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2 mr-2">
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
                            <div className="w-px h-6 bg-slate-100" />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsChannelTasksOpen(!isChannelTasksOpen)}
                                className={cn("text-slate-400 hover:text-slate-600", isChannelTasksOpen && "bg-slate-100 text-slate-900")}
                                title={isChannelTasksOpen ? "Hide Channel Tasks" : "Show Channel Tasks"}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </Button>
                        </div>
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
            <ScrollArea className="flex-1 p-6 bg-white">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Welcome Message */}
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                            {activeView === "channel" ? <Hash className="w-8 h-8" /> : <UserIcon className="w-8 h-8" />}
                        </div>
                        <h3 className="font-bold text-slate-900">
                            This is the beginning of the {activeView === "channel" ? `#${activeChannel?.name}` : activeDm?.user.name} {activeView === "channel" ? "channel" : "conversation"}.
                        </h3>
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
                                    <div className="w-8 flex-shrink-0 flex flex-col items-center">
                                        {showHeader && !isMe && (
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={sender?.avatar} />
                                                <AvatarFallback>{sender?.name[0]}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        {showHeader && isMe && (
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={currentUser.avatar} />
                                                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
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
                                            "px-4 py-2.5 shadow-sm text-sm leading-relaxed relative group-hover:shadow-md transition-shadow",
                                            isMe 
                                                ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" 
                                                : "bg-slate-100 text-slate-900 rounded-2xl rounded-tl-sm"
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
                                                "absolute -top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-slate-200 shadow-sm rounded-full p-1 z-10",
                                                isMe ? "right-0" : "left-0"
                                            )}>
                                                {["👍", "❤️", "😂", "😮", "😢", "🔥"].map(emoji => (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => toggleReaction(msg.id, emoji)}
                                                        className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-full text-sm transition-colors"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(msg.content);
                                                        showNotification({
                                                            title: "Copied",
                                                            message: "Message text copied to clipboard",
                                                            type: "success"
                                                        });
                                                    }}
                                                    className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                                                    title="Copy text"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
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
                                                    className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-full transition-colors"
                                                    title="Convert to Task"
                                                >
                                                    <CheckSquare className="w-3.5 h-3.5" />
                                                </button>
                                                {(isMe || currentUser.role?.toLowerCase() === 'admin') && (
                                                    <div className="w-px h-3 bg-slate-200 mx-1" />
                                                )}
                                                {(isMe || currentUser.role?.toLowerCase() === 'admin') && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm("Are you sure you want to delete this message?")) {
                                                                deleteMessage(msg.id);
                                                            }
                                                        }}
                                                        className="w-6 h-6 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
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
                                                                    ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" 
                                                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
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
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="max-w-3xl mx-auto">
                    <div className="border border-slate-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all bg-white">
                        <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-8 h-8 text-slate-500 hover:text-slate-700"
                                onClick={() => insertFormatting("**")}
                                title="Bold"
                            >
                                <Bold className="w-4 h-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-8 h-8 text-slate-500 hover:text-slate-700"
                                onClick={() => insertFormatting("_")}
                                title="Italic"
                            >
                                <Italic className="w-4 h-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-8 h-8 text-slate-500 hover:text-slate-700"
                                onClick={() => insertFormatting("[text](url)")}
                                title="Link"
                            >
                                <LinkIcon className="w-4 h-4" />
                            </Button>
                            <div className="w-px h-4 bg-slate-200 mx-1" />
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-8 h-8 text-slate-500 hover:text-slate-700"
                                onClick={() => insertFormatting("- ")}
                                title="Bullet List"
                            >
                                <ListIcon className="w-4 h-4" />
                            </Button>
                            <div className="w-px h-4 bg-slate-200 mx-1" />
                            <div className="relative">
                                <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-500 hover:text-slate-700" title="Attach Files">
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
                                        className="w-8 h-8 text-slate-500 hover:text-slate-700"
                                        title="Emoji"
                                    >
                                        <Smile className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="p-2 grid grid-cols-6 gap-1 w-[240px]">
                                    {["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩"].map((emoji) => (
                                        <button 
                                            key={emoji} 
                                            className="h-8 w-8 flex items-center justify-center hover:bg-slate-100 rounded text-lg"
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
                            {/* Typing Indicator */}
                            {(typingUsers?.[activeChannelId || activeDmId || ""] || []).length > 0 && (
                                <div className="ml-auto flex items-center gap-1.5 px-2">
                                    <div className="flex space-x-0.5">
                                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {(typingUsers?.[activeChannelId || activeDmId || ""] || [])
                                            .map(id => users.find(u => u.id === id)?.name)
                                            .filter(Boolean)
                                            .join(", ") + " is typing..."}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="p-3">
                            {messageAttachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {messageAttachments.map((file) => (
                                        <div key={file.id} className="relative group">
                                            <div className="flex items-center gap-2 p-1.5 pr-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                                                {file.type === 'image' ? (
                                                    <div className="w-8 h-8 rounded bg-slate-200 overflow-hidden">
                                                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center">
                                                        <Paperclip className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col max-w-[120px]">
                                                    <span className="font-medium truncate">{file.name}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase">{file.size}</span>
                                                </div>
                                                <button 
                                                    onClick={() => removeAttachment(file.id)}
                                                    className="ml-1 p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
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
                                className="w-full resize-none border-0 focus:ring-0 p-0 min-h-[40px] max-h-[300px] text-slate-900 placeholder:text-slate-400 bg-transparent text-sm"
                                rows={1}
                            />
                        </div>
                        <div className="flex items-center justify-between p-2 pt-0">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-full"
                                onClick={() => openCreateTask("todo")}
                                title="Create Task"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </Button>
                            <Button 
                                size="icon" 
                                onClick={() => handleSendMessage()} 
                                disabled={!inputValue.trim()}
                                className={cn("h-8 w-8 rounded-lg transition-all", inputValue.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-200 text-slate-400")}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Sidebar - Shared Tasks (DM Only) */}
          {activeView === "dm" && activeDm && isSharedTasksOpen && (
              <div className="w-[320px] bg-white border-l border-slate-200 flex flex-col h-full">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                          <h3>Shared Tasks</h3>
                      </div>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                  <MoreHorizontal className="w-4 h-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                                      className="h-5 w-5 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
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
                                              className="p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer group"
                                              onClick={() => {
                                                  setSelectedTaskId(task.id);
                                                  setIsTaskDetailOpen(true);
                                              }}
                                          >
                                              <div className="flex items-start gap-3">
                                                  <div 
                                                      className={cn(
                                                          "w-4 h-4 mt-0.5 rounded border border-slate-300 hover:border-blue-500 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0",
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
                                                      <h5 className={cn("text-sm font-medium text-slate-900 truncate", task.status === 'done' && "line-through text-slate-400")}>{task.title}</h5>
                                                      <div className="flex items-center gap-2 mt-1.5">
                                                          <span className={cn(
                                                              "text-[10px] px-1.5 py-0.5 rounded font-medium",
                                                              task.priority === "high" ? "bg-red-50 text-red-600" :
                                                              task.priority === "medium" ? "bg-amber-50 text-amber-600" :
                                                              "bg-slate-100 text-slate-600"
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
                                      className="h-5 w-5 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
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
                                              className="p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer group"
                                              onClick={() => {
                                                  setSelectedTaskId(task.id);
                                                  setIsTaskDetailOpen(true);
                                              }}
                                          >
                                              <div className="flex items-start gap-3">
                                                  <div 
                                                      className={cn(
                                                          "w-4 h-4 mt-0.5 rounded border border-slate-300 hover:border-blue-500 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0",
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
                                                      <h5 className={cn("text-sm font-medium text-slate-900 truncate", task.status === 'done' && "line-through text-slate-400")}>{task.title}</h5>
                                                      <div className="flex items-center gap-2 mt-1.5">
                                                          <span className={cn(
                                                              "text-[10px] px-1.5 py-0.5 rounded font-medium",
                                                              task.priority === "high" ? "bg-red-50 text-red-600" :
                                                              task.priority === "medium" ? "bg-amber-50 text-amber-600" :
                                                              "bg-slate-100 text-slate-600"
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
                                          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                              <CheckCircle2 className="w-5 h-5 text-slate-300" />
                                          </div>
                                          <p className="text-xs text-slate-400">No tasks assigned to {activeDm.user.name.split(' ')[0]}</p>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t border-slate-100">
                      <Button 
                          variant="outline" 
                          className="w-full border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                          onClick={() => openCreateTask("todo")}
                      >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Create Shared Task
                      </Button>
                  </div>
              </div>
          )}

          {/* Right Sidebar - Channel Tasks (Channel Only) */}
          {activeView === "channel" && activeChannel && isChannelTasksOpen && (
              <div className="w-[320px] bg-white border-l border-slate-200 flex flex-col h-full">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                          <h3>Channel Tasks</h3>
                      </div>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                  <MoreHorizontal className="w-4 h-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Channel Task Actions</DropdownMenuLabel>
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
                          {/* Active Tasks */}
                          <div>
                              <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active in #{activeChannel.name}</h4>
                                  <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-5 w-5 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                      onClick={() => openCreateTask("todo")}
                                  >
                                      <PlusIcon className="w-3 h-3" />
                                  </Button>
                              </div>
                              <div className="space-y-2">
                                  {tasks
                                      .filter(t => t.channelId === activeChannel.id && t.status !== 'done')
                                      .slice(0, 10)
                                      .map(task => (
                                          <div 
                                              key={task.id} 
                                              className="p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer group"
                                              onClick={() => {
                                                  setSelectedTaskId(task.id);
                                                  setIsTaskDetailOpen(true);
                                              }}
                                          >
                                              <div className="flex items-start gap-3">
                                                  <div 
                                                       className="w-4 h-4 mt-0.5 rounded border border-slate-300 hover:border-blue-500 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
                                                       onClick={(e) => {
                                                           e.stopPropagation();
                                                           updateTaskStatus(task.id, 'done');
                                                       }}
                                                   >
                                                       {task.status === 'done' && <Check className="w-2.5 h-2.5 text-blue-600" />}
                                                   </div>
                                                  <div className="flex-1 min-w-0">
                                                      <h5 className="text-sm font-medium text-slate-900 truncate">{task.title}</h5>
                                                      <div className="flex items-center gap-2 mt-1.5">
                                                          <span className={cn(
                                                              "text-[10px] px-1.5 py-0.5 rounded font-medium",
                                                              task.priority === "high" ? "bg-red-50 text-red-600" :
                                                              task.priority === "medium" ? "bg-amber-50 text-amber-600" :
                                                              "bg-slate-100 text-slate-600"
                                                          )}>
                                                              {task.priority}
                                                          </span>
                                                          <div className="flex -space-x-1 ml-auto">
                                                              {task.assigneeIds.map(id => {
                                                                  const user = users.find(u => u.id === id);
                                                                  return (
                                                                      <Avatar key={id} className="w-4 h-4 border border-white">
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
                                          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                              <CheckCircle2 className="w-5 h-5 text-slate-300" />
                                          </div>
                                          <p className="text-xs text-slate-400">No active tasks in this channel</p>
                                      </div>
                                  )}
                              </div>
                          </div>

                          {/* Recently Completed */}
                          <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recently Completed</h4>
                              <div className="space-y-2">
                                  {tasks
                                      .filter(t => t.channelId === activeChannel.id && t.status === 'done' && t.completedAt && (new Date().getTime() - new Date(t.completedAt).getTime() < 2 * 60 * 60 * 1000))
                                      .slice(0, 3)
                                      .map(task => (
                                          <div 
                                              key={task.id} 
                                              className="p-3 bg-slate-50 border border-slate-100 rounded-lg opacity-75 hover:opacity-100 transition-opacity cursor-pointer group"
                                              onClick={() => {
                                                  setSelectedTaskId(task.id);
                                                  setIsTaskDetailOpen(true);
                                              }}
                                          >
                                              <div className="flex items-start gap-3">
                                                  <div 
                                                       className="w-4 h-4 mt-0.5 rounded bg-blue-500 border border-blue-500 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
                                                       onClick={(e) => {
                                                           e.stopPropagation();
                                                           updateTaskStatus(task.id, 'todo');
                                                       }}
                                                   >
                                                       <Check className="w-2.5 h-2.5 text-white" />
                                                   </div>
                                                  <div className="flex-1 min-w-0">
                                                      <h5 className="text-sm font-medium text-slate-500 truncate line-through">{task.title}</h5>
                                                      <div className="flex items-center gap-2 mt-1">
                                                          <span className="text-[10px] text-slate-400">
                                                              Completed {new Date(task.completedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                          </span>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      ))}
                                  {tasks.filter(t => t.channelId === activeChannel.id && t.status === 'done' && t.completedAt && (new Date().getTime() - new Date(t.completedAt).getTime() < 2 * 60 * 60 * 1000)).length === 0 && (
                                      <p className="text-xs text-slate-400 italic">No tasks completed in the last 2 hours</p>
                                  )}
                              </div>
                          </div>
                      </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t border-slate-100">
                      <Button 
                          variant="outline" 
                          className="w-full border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                          onClick={() => openCreateTask("todo")}
                      >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Create Channel Task
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
    </div>
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
      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={cn(
          "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide",
          task.priority === "high" ? "bg-red-50 text-red-600" :
          task.priority === "medium" ? "bg-amber-50 text-amber-600" :
          "bg-green-50 text-green-600"
        )}>
          {task.priority || "Low"}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2 focus:opacity-100 data-[state=open]:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(task); }}>Edit Task</DropdownMenuItem>
            {task.status !== 'todo' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task, 'todo'); }}>
                    Move to To Do
                </DropdownMenuItem>
            )}
            {task.status !== 'in_progress' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task, 'in_progress'); }}>
                    Move to In Progress
                </DropdownMenuItem>
            )}
            {task.status !== 'done' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task, 'done'); }}>
                    Mark as Done
                </DropdownMenuItem>
            )}
            {isCreatorOrAdmin && (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="text-red-600 focus:text-red-600">Delete Task</DropdownMenuItem>
                </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <h4 className={cn("font-semibold text-slate-900 mb-3 text-sm leading-snug", task.status === 'done' && "line-through text-slate-400")}>
        {task.title}
      </h4>

      {task.status === 'todo' && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mb-3 bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-semibold h-8"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(task, 'in_progress');
          }}
        >
          Start Task
        </Button>
      )}
      
      {task.status === 'in_progress' && (
         <div className="mb-3">
            <div className="flex gap-1 h-1.5 w-full mb-1">
               {[25, 50, 75, 100].map((p) => (
                  <div 
                     key={p}
                     className={cn(
                        "flex-1 rounded-full cursor-pointer transition-all hover:opacity-80 hover:h-2",
                        (task.progress || 0) >= p 
                            ? (p === 100 ? "bg-green-500" : "bg-blue-500") 
                            : "bg-slate-100 hover:bg-slate-200"
                     )}
                     onClick={(e) => {
                        e.stopPropagation();
                        onProgressChange(task, p);
                     }}
                     title={p === 100 ? "Done" : `${p}%`}
                  />
               ))}
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-medium px-0.5 mt-1">
               <span className={cn((task.progress || 0) >= 25 && "text-blue-600")}>25%</span>
               <span className={cn((task.progress || 0) >= 50 && "text-blue-600")}>50%</span>
               <span className={cn((task.progress || 0) >= 75 && "text-blue-600")}>75%</span>
               <span className={cn((task.progress || 0) >= 100 && "text-green-600")}>Done</span>
            </div>
         </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <div className={cn("flex items-center gap-1.5 text-xs font-medium", 
           task.dueDate === "Due Today" ? "text-red-500" : "text-slate-400"
        )}>
           <Calendar className="w-3.5 h-3.5" />
           <span>{task.dueDate}</span>
        </div>
        
        <div className="flex -space-x-2">
           {task.assigneeIds?.map((id: string) => {
             const user = users.find(u => u.id === id);
             if (!user) return null;
             return (
               <Avatar key={id} className="w-6 h-6 border-2 border-white">
                 <AvatarImage src={user.avatar} />
                 <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600">{user.name[0]}</AvatarFallback>
               </Avatar>
             );
           })}
           {task.status === 'done' && (
               <div className="w-6 h-6 rounded-full bg-green-50 border-2 border-white flex items-center justify-center text-green-600">
                  <CheckSquare className="w-3 h-3" />
               </div>
          )}
        </div>
      </div>
    </div>
  );
}
