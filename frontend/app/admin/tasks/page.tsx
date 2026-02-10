"use client";

import { useState } from "react";
import { Search, Filter, Download, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspace } from "@/features/workspace/context";

export default function AdminTasksPage() {
  const { tasks, users } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Helper to get user details
  const getUser = (userId: string) => users.find(u => u.id === userId);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 hover:bg-red-100";
      case "medium": return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      case "low": return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      default: return "bg-slate-100 text-slate-700 hover:bg-slate-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "in_progress": return <Clock className="w-4 h-4 text-blue-600" />;
      case "todo": return <AlertCircle className="w-4 h-4 text-slate-400" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "done": return "Completed";
      case "in_progress": return "In Progress";
      case "todo": return "To Do";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
          <p className="text-slate-500 mt-1">Monitor and track project tasks across the workspace.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="gap-2 text-slate-600 border-slate-200">
             <Download className="w-4 h-4" />
             Export CSV
           </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search tasks..." 
                className="pl-9 bg-slate-50 border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
         </div>
         <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="relative">
              <select 
                className="h-9 rounded-md border border-slate-200 bg-white pl-3 pr-8 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Status: All</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                className="h-9 rounded-md border border-slate-200 bg-white pl-3 pr-8 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 appearance-none cursor-pointer"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">Priority: All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
            <span className="text-xs text-slate-400 ml-2">Showing {filteredTasks.length} tasks</span>
         </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[350px] text-xs uppercase tracking-wider font-semibold text-slate-500">Task Details</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500">Assignees</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500">Priority</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider font-semibold text-slate-500">Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No tasks found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{task.title}</span>
                      {task.description && (
                        <span className="text-xs text-slate-500 truncate max-w-[300px] mt-0.5">{task.description}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {task.assigneeIds.map((userId) => {
                        const user = getUser(userId);
                        if (!user) return null;
                        return (
                          <Avatar key={userId} className="w-7 h-7 border-2 border-white ring-1 ring-slate-100">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-[10px]">
                              {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                      {task.assigneeIds.length === 0 && (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm text-slate-700 capitalize">
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={`${getPriorityColor(task.priority)} border-none font-semibold text-[10px] px-2 py-0.5 uppercase`}
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span className="text-sm">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
