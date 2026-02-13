"use client";

import { useState } from "react";
import { Search, Filter, History, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspace } from "@/features/workspace/context";
import { Task } from "@/types";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function TaskArchivePage() {
  const { tasks, users, currentUser, updateTask, deleteTask, addTaskComment } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  // Archive only shows "done" tasks
  const archiveTasks = tasks.filter(t => t.status === "done");

  const filteredTasks = archiveTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getUser = (userId: string) => users.find(u => u.id === userId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-orange-100 text-orange-700";
      case "low": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <History className="w-6 h-6 text-slate-400" />
          Task Archive
        </h1>
        <p className="text-slate-500 mt-1">Permanent record of all completed tasks in the workspace.</p>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search archive..." 
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500">
          Total Archived: {filteredTasks.length} tasks
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[350px]">Task Details</TableHead>
              <TableHead>Assignees</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Completed On</TableHead>
              <TableHead className="text-right">Original Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No archived tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow 
                  key={task.id} 
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  onClick={() => {
                    setSelectedTask(task);
                    setIsTaskDetailOpen(true);
                  }}
                >
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-900">{task.title}</span>
                      <span className="text-xs text-slate-500 line-clamp-1">{task.description || "No description"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {task.assigneeIds.map((userId) => {
                        const user = getUser(userId);
                        if (!user) return null;
                        return (
                          <Avatar key={userId} className="w-7 h-7 border-2 border-white">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${getPriorityColor(task.priority)} border-none text-[10px] uppercase`}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      {task.completedAt ? format(new Date(task.completedAt), "MMM d, h:mm a") : "Recently"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-slate-500 text-sm">
                    {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No date"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TaskDetailModal 
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        users={users}
        currentUser={currentUser}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onAddComment={addTaskComment}
      />
    </div>
  );
}
