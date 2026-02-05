"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bold, Italic, List, Link as LinkIcon, Check } from "lucide-react";
import { useWorkspace } from "@/features/workspace/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Task } from "@/types";
import { useEffect } from "react";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStatus?: "todo" | "in_progress" | "done";
  taskToEdit?: Task | null;
}

export function CreateTaskDialog({ open, onOpenChange, initialStatus = "todo", taskToEdit }: CreateTaskDialogProps) {
  const { createTask, updateTask, users, channels } = useWorkspace();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [channelId, setChannelId] = useState<string>("");

  useEffect(() => {
    if (open) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || "");
        setAssigneeIds(taskToEdit.assigneeIds || []);
        setDueDate(taskToEdit.dueDate === "No date" ? "" : taskToEdit.dueDate);
        setPriority(taskToEdit.priority);
        setChannelId(taskToEdit.channelId || "");
      } else {
        setTitle("");
        setDescription("");
        setAssigneeIds([]);
        setDueDate("");
        setPriority("medium");
        setChannelId("");
      }
    }
  }, [open, taskToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskToEdit) {
      updateTask({
        ...taskToEdit,
        title,
        description,
        assigneeIds,
        dueDate: dueDate || "No date",
        priority,
        channelId: channelId || undefined,
      });
    } else {
      createTask({
        title,
        description,
        status: initialStatus,
        assigneeIds,
        dueDate: dueDate || "No date",
        priority,
        channelId: channelId || undefined,
      });
    }

    // Reset and close
    onOpenChange(false);
  };

  const selectedUsers = users.filter((u) => assigneeIds.includes(u.id));
  const selectedChannel = channels.find((c) => c.id === channelId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 py-4 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {taskToEdit ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-slate-700">Task Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base py-5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Description</Label>
            <div className="border border-slate-200 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2">
              <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50">
                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                  <List className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                id="description"
                placeholder="Add details or context for your team..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-0 rounded-none focus-visible:ring-0 min-h-[120px] resize-none p-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Assignees</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal text-left h-auto min-h-[44px] px-3 py-2"
                  >
                    {selectedUsers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                          <div key={user.id} className="flex items-center gap-1.5 bg-slate-100 rounded-full pl-1 pr-2 py-0.5">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500">Select teammates</span>
                    )}
                    {/* Placeholder gradient box from design */}
                    {selectedUsers.length === 0 && <div className="h-5 w-5 bg-gradient-to-br from-green-200 to-blue-200 rounded opacity-70" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[240px]" align="start">
                  <DropdownMenuLabel>Team Members</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {users.map((user) => {
                    const isSelected = assigneeIds.includes(user.id);
                    return (
                      <DropdownMenuItem 
                        key={user.id} 
                        onClick={(e) => {
                            e.preventDefault();
                            setAssigneeIds(prev => 
                                isSelected 
                                ? prev.filter(id => id !== user.id)
                                : [...prev, user.id]
                            );
                        }} 
                        className="gap-2 cursor-pointer"
                      >
                        <div className={cn(
                            "flex items-center justify-center w-4 h-4 border rounded-sm mr-1 transition-colors",
                            isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                        )}>
                            {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-semibold text-slate-700">Due Date</Label>
              <div className="relative">
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-11 w-full"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Priority</Label>
            <div className="flex p-1 bg-slate-100 rounded-lg">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "flex-1 py-1.5 text-sm font-medium rounded-md transition-all capitalize",
                    priority === p
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Link to Channel</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal text-left h-11 px-3"
                >
                  {selectedChannel ? (
                    <span className="truncate text-slate-900"># {selectedChannel.name}</span>
                  ) : (
                    <span className="text-slate-900">No channel linked</span>
                  )}
                  <div className="h-5 w-5 bg-gradient-to-br from-green-200 to-blue-200 rounded opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[400px]" align="start">
                <DropdownMenuLabel>Select Channel</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setChannelId("")} className="cursor-pointer">
                  No channel linked
                </DropdownMenuItem>
                {channels.map((channel) => (
                  <DropdownMenuItem key={channel.id} onClick={() => setChannelId(channel.id)} className="cursor-pointer">
                    # {channel.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="text-xs text-slate-400">Linked tasks will notify the selected channel when updated.</p>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 px-8">
              Cancel
            </Button>
            <Button type="submit" className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white">
              {taskToEdit ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
