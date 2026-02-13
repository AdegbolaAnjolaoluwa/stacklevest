"use client";

import React, { useState } from "react";
import { 
  X, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Tag, 
  AlertCircle,
  MoreHorizontal,
  Trash2,
  History
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Task, User as UserType } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddComment: (taskId: string, content: string) => void;
  currentUser: UserType;
}

export function TaskDetailModal({ 
  task, 
  isOpen, 
  onClose, 
  users,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
  currentUser
}: TaskDetailModalProps) {
  const [newComment, setNewComment] = useState("");
  if (!task) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(task.id, newComment);
    setNewComment("");
  };

  const isCreatorOrAdmin = task.creatorId === currentUser.id || currentUser.role?.toLowerCase() === 'admin';

  const assignees = task.assigneeIds.map(id => users.find(u => u.id === id)).filter(Boolean) as UserType[];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-slate-100 text-slate-600";
      case "in_progress": return "bg-blue-100 text-blue-700";
      case "done": return "bg-green-100 text-green-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const handleMarkAsComplete = () => {
    if (!task) return;
    const isDone = task.status === "done";
    onUpdateTask({
      ...task,
      status: isDone ? "todo" : "done",
      progress: isDone ? 0 : 100,
      completedAt: isDone ? undefined : new Date().toISOString()
    });
  };

  const creator = users.find(u => u.id === task.creatorId);
  const activityHistory = [
    { 
      id: 'create', 
      user: creator?.name || 'Unknown User', 
      action: 'created the task', 
      time: task.createdAt ? format(new Date(task.createdAt), 'MMM d, h:mm a') : 'Recently' 
    },
  ];

  if (task.completedAt) {
    activityHistory.push({
      id: 'complete',
      user: assignees[0]?.name || 'Assignee',
      action: 'marked the task as complete',
      time: format(new Date(task.completedAt), 'MMM d, h:mm a')
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className={cn("capitalize font-medium", getStatusColor(task.status))}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={cn("capitalize font-medium", getPriorityColor(task.priority))}>
                  {task.priority} Priority
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900 leading-tight">
                {task.title}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {isCreatorOrAdmin && (
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600" onClick={() => onDeleteTask(task.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Main Content */}
            <div className="flex-1 p-6 space-y-8">
              {/* Description */}
              <section>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Description
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {task.description || "No description provided for this task."}
                </p>
              </section>

              {/* Comments Section */}
              <section>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Comments
                </h3>
                <div className="space-y-4 mb-6">
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((comment) => {
                      const commentUser = users.find(u => u.id === comment.userId);
                      return (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={commentUser?.avatar} />
                            <AvatarFallback>{commentUser?.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="bg-slate-50 p-3 rounded-lg text-sm flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="font-semibold text-slate-900">{commentUser?.name}</span>
                              <span className="text-[10px] text-slate-400">
                                {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-400 italic px-1">No comments yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 min-h-[80px] p-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                    />
                    <Button type="submit" size="sm" className="self-end" disabled={!newComment.trim()}>
                      Send
                    </Button>
                  </div>
                </form>
              </section>

              {/* Activity History */}
              <section>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" />
                  Activity History
                </h3>
                <div className="space-y-4">
                  {activityHistory.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-slate-900">{activity.user}</span>
                        <span className="text-slate-500 mx-1">{activity.action}</span>
                        <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Details */}
            <div className="w-full md:w-64 p-6 bg-slate-50/30 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Assignees</label>
                  <div className="flex flex-wrap gap-2">
                    {assignees.length > 0 ? (
                      assignees.map((user) => (
                        <div key={user.id} className="flex items-center gap-2 bg-white p-1.5 pr-3 rounded-full border border-slate-200 shadow-sm">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-[10px]">{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-slate-700 truncate max-w-[80px]">{user.name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Due Date</label>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No due date"}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Labels</label>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none px-2 py-0">
                      <Tag className="w-3 h-3 mr-1" />
                      Internal
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <Button 
                  variant={task.status === "done" ? "outline" : "default"} 
                  className={cn(
                    "w-full justify-start gap-2",
                    task.status === "done" ? "text-slate-600 hover:bg-white" : "bg-green-600 hover:bg-green-700 text-white"
                  )} 
                  onClick={handleMarkAsComplete}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {task.status === "done" ? "Mark as Incomplete" : "Mark as Complete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
